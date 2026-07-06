import { BLOCK_DEFS } from "./palette";
import { hash3 } from "./rng";
import type { VoxelModel } from "./model";

/**
 * Greedy mesher with baked lighting:
 *  - per-vertex ambient occlusion (classic 3-neighbor formula)
 *  - directional face tints (warm sun from +X/+Y, plum-shifted shadow sides)
 *  - quantized per-block color jitter (part of the merge key → tonal patches)
 * Emissive blocks go to a separate unlit "glow" geometry, plus halo points
 * for additive sprite glows.
 */

export interface MeshBuffers {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
}

export interface GlowHalo {
  pos: [number, number, number];
  color: string;
  strength: number;
  count: number;
}

export interface MeshResult {
  lit: MeshBuffers;
  glow: MeshBuffers;
  halos: GlowHalo[];
}

// —— face tints: sun low from the +X horizon, warm tops, plum shadows ——
const FACE_TINT: Record<string, { mult: number; plum: number }> = {
  "+y": { mult: 1.14, plum: 0 },
  "-y": { mult: 0.5, plum: 0.35 },
  "+x": { mult: 1.04, plum: 0 },
  "-x": { mult: 0.72, plum: 0.25 },
  "+z": { mult: 0.92, plum: 0.1 },
  "-z": { mult: 0.78, plum: 0.2 },
};

const AO_MULT = [0.5, 0.67, 0.84, 1.0];
const AO_PLUM = [0.38, 0.24, 0.1, 0];
const PLUM = hexToRgb("#4a3b6b");
const JITTER_LEVELS = 5;
const JITTER_SPAN = 0.09; // ±9% value variation across levels

export function meshVoxels(model: VoxelModel): MeshResult {
  const dims = [model.nx, model.ny, model.nz];
  const lit = new GeoAcc();
  const glow = new GeoAcc();
  const emissivePts: { x: number; y: number; z: number; id: number }[] = [];

  // collect emissive block centers for halos
  for (let z = 0; z < model.nz; z++)
    for (let y = 0; y < model.ny; y++)
      for (let x = 0; x < model.nx; x++) {
        const id = model.get(x, y, z);
        if (id && (BLOCK_DEFS[id].emissive ?? 0) > 0)
          emissivePts.push({ x, y, z, id });
      }

  const solid = (p: number[]) => model.get(p[0], p[1], p[2]) !== 0;

  for (let d = 0; d < 3; d++) {
    const u = (d + 1) % 3;
    const v = (d + 2) % 3;
    const nu = dims[u];
    const nv = dims[v];

    // mask entries: 0 = no face, else packed key; parallel arrays hold detail
    const maskKey = new Int32Array(nu * nv);
    const maskAO = new Uint8Array(nu * nv * 4);
    const maskId = new Uint8Array(nu * nv);
    const maskSign = new Int8Array(nu * nv);

    const pa = [0, 0, 0];
    const pb = [0, 0, 0];

    for (let s = 0; s <= dims[d]; s++) {
      maskKey.fill(0);
      let any = false;

      for (let j = 0; j < nv; j++)
        for (let i = 0; i < nu; i++) {
          pa[d] = s - 1; pa[u] = i; pa[v] = j;
          pb[d] = s;     pb[u] = i; pb[v] = j;
          const a = model.get(pa[0], pa[1], pa[2]);
          const b = model.get(pb[0], pb[1], pb[2]);
          if ((a !== 0) === (b !== 0)) continue;

          const sign = a !== 0 ? 1 : -1;
          const id = a !== 0 ? a : b;
          const emptyD = a !== 0 ? s : s - 1; // layer AO samples live in
          const blockPos = a !== 0 ? [...pa] : [...pb];

          // AO for the 4 corners of this cell
          const m = i + nu * j;
          const q = [0, 0, 0];
          const solidAt = (du: number, dv: number) => {
            q[d] = emptyD;
            q[u] = i + du;
            q[v] = j + dv;
            return solid(q) ? 1 : 0;
          };
          // corners in (u,v): (0,0) (1,0) (1,1) (0,1)
          const corners: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
          let aoPack = 0;
          for (let c = 0; c < 4; c++) {
            const [ca, cb] = corners[c];
            const side1 = solidAt(ca ? 1 : -1, 0);
            const side2 = solidAt(0, cb ? 1 : -1);
            const diag = solidAt(ca ? 1 : -1, cb ? 1 : -1);
            const ao =
              side1 && side2 ? 0 : 3 - (side1 + side2 + diag);
            maskAO[m * 4 + c] = ao;
            aoPack = (aoPack << 2) | ao;
          }

          const def = BLOCK_DEFS[id];
          const jitter = def.flat
            ? 0
            : Math.floor(
                hash3(blockPos[0], blockPos[1], blockPos[2]) * JITTER_LEVELS
              );

          maskId[m] = id;
          maskSign[m] = sign;
          // key: id(7b) sign(1b) ao(8b) jitter(3b) — nonzero when face exists
          maskKey[m] =
            1 | (id << 1) | ((sign > 0 ? 1 : 0) << 8) | (aoPack << 9) | (jitter << 17);
          any = true;
        }

      if (!any) continue;

      // greedy merge
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; ) {
          const m = i + nu * j;
          const key = maskKey[m];
          if (!key) { i++; continue; }

          let w = 1;
          while (i + w < nu && maskKey[m + w] === key) w++;
          let h = 1;
          outer: while (j + h < nv) {
            for (let k = 0; k < w; k++)
              if (maskKey[i + k + nu * (j + h)] !== key) break outer;
            h++;
          }

          const id = maskId[m];
          const sign = maskSign[m];
          const ao = [
            maskAO[m * 4], maskAO[m * 4 + 1], maskAO[m * 4 + 2], maskAO[m * 4 + 3],
          ];
          const jitter = (key >> 17) & 7;

          emitQuad(id, d, u, v, s, i, j, w, h, sign, ao, jitter);

          for (let dj = 0; dj < h; dj++)
            for (let di = 0; di < w; di++)
              maskKey[i + di + nu * (j + dj)] = 0;
          i += w;
        }
      }
    }
  }

  // halos: cluster emissive blocks on a coarse grid
  const halos = clusterHalos(emissivePts);

  return {
    lit: lit.buffers(),
    glow: glow.buffers(),
    halos,
  };

  // — emit one greedy quad into the right accumulator —
  function emitQuad(
    id: number,
    d: number, u: number, v: number,
    s: number, i: number, j: number, w: number, h: number,
    sign: number,
    ao: number[],
    jitter: number
  ) {
    const def = BLOCK_DEFS[id];
    const isGlow = (def.emissive ?? 0) > 0;
    const acc = isGlow ? glow : lit;

    const dirName =
      (sign > 0 ? "+" : "-") + (d === 0 ? "x" : d === 1 ? "y" : "z");
    const tint = FACE_TINT[dirName];

    // corners in (u,v) space
    const cs: [number, number][] = [
      [i, j], [i + w, j], [i + w, j + h], [i, j + h],
    ];
    const pts = cs.map(([cu, cv]) => {
      const p = [0, 0, 0];
      p[d] = s;
      p[u] = cu;
      p[v] = cv;
      return p as [number, number, number];
    });

    const normal: [number, number, number] = [0, 0, 0];
    normal[d] = sign;

    const base = hexToRgb(def.color);
    const jitterMult = def.flat
      ? 1
      : 1 - JITTER_SPAN / 2 + (jitter / (JITTER_LEVELS - 1)) * JITTER_SPAN;

    const vColors = ao.map((a) => {
      if (isGlow) {
        // glow faces: full color, slight AO-free brightness by emissive
        const e = def.emissive ?? 0.5;
        return [
          srgbToLinear(Math.min(1, base[0] * (0.85 + e * 0.5))),
          srgbToLinear(Math.min(1, base[1] * (0.85 + e * 0.5))),
          srgbToLinear(Math.min(1, base[2] * (0.85 + e * 0.5))),
        ] as [number, number, number];
      }
      const mult = tint.mult * AO_MULT[a] * jitterMult;
      const plumMix = Math.min(1, tint.plum + AO_PLUM[a]);
      return [
        srgbToLinear(mix(base[0] * mult, PLUM[0], plumMix)),
        srgbToLinear(mix(base[1] * mult, PLUM[1], plumMix)),
        srgbToLinear(mix(base[2] * mult, PLUM[2], plumMix)),
      ] as [number, number, number];
    });

    // AO-aware diagonal: flip when it lights better
    const flip = ao[0] + ao[2] < ao[1] + ao[3];
    let tri: number[][];
    if (sign > 0) {
      tri = flip ? [[1, 2, 3], [1, 3, 0]] : [[0, 1, 2], [0, 2, 3]];
    } else {
      tri = flip ? [[1, 3, 2], [1, 0, 3]] : [[0, 2, 1], [0, 3, 2]];
    }
    for (const t of tri)
      for (const k of t) acc.push(pts[k], normal, vColors[k]);
  }
}

function clusterHalos(
  pts: { x: number; y: number; z: number; id: number }[]
): GlowHalo[] {
  const CELL = 5;
  const cells = new Map<
    string,
    { sx: number; sy: number; sz: number; n: number; id: number; e: number }
  >();
  for (const p of pts) {
    const def = BLOCK_DEFS[p.id];
    const key = `${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)},${Math.floor(p.z / CELL)},${p.id}`;
    const c = cells.get(key) ?? { sx: 0, sy: 0, sz: 0, n: 0, id: p.id, e: def.emissive ?? 0.5 };
    c.sx += p.x + 0.5;
    c.sy += p.y + 0.5;
    c.sz += p.z + 0.5;
    c.n++;
    cells.set(key, c);
  }
  return [...cells.values()].map((c) => ({
    pos: [c.sx / c.n, c.sy / c.n, c.sz / c.n] as [number, number, number],
    color: BLOCK_DEFS[c.id].color,
    strength: c.e,
    count: c.n,
  }));
}

class GeoAcc {
  positions: number[] = [];
  normals: number[] = [];
  colors: number[] = [];

  push(p: [number, number, number], n: [number, number, number], c: [number, number, number]) {
    this.positions.push(p[0], p[1], p[2]);
    this.normals.push(n[0], n[1], n[2]);
    this.colors.push(c[0], c[1], c[2]);
  }

  buffers(): MeshBuffers {
    return {
      positions: new Float32Array(this.positions),
      normals: new Float32Array(this.normals),
      colors: new Float32Array(this.colors),
    };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function srgbToLinear(c: number): number {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
