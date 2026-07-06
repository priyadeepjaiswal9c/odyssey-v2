import { BLOCK_DEFS, type MatClass } from "./palette";
import { hash3 } from "./rng";
import type { VoxelModel } from "./model";

/**
 * Greedy mesher for the RTX pipeline:
 *  - output geometry grouped by material class (matte/gloss/metal/water/glow)
 *  - per-vertex ambient occlusion baked into vertex colors (warm-neutral)
 *  - soft directional tints + quantized per-block jitter (merge-key aware)
 * Real lighting (sun + env + shadows + bloom) does the heavy lifting now;
 * the bakes just keep crevices grounded and surfaces alive.
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

export type MeshGroups = Partial<Record<MatClass, MeshBuffers>>;

export interface MeshResult {
  groups: MeshGroups;
  halos: GlowHalo[];
}

// —— gentle face tints: sun low from +X, warm tops, umber-shadowed undersides ——
const FACE_TINT: Record<string, { mult: number; umber: number }> = {
  "+y": { mult: 1.06, umber: 0 },
  "-y": { mult: 0.6, umber: 0.28 },
  "+x": { mult: 1.0, umber: 0 },
  "-x": { mult: 0.84, umber: 0.12 },
  "+z": { mult: 0.94, umber: 0.05 },
  "-z": { mult: 0.88, umber: 0.1 },
};

const AO_MULT = [0.55, 0.72, 0.87, 1.0];
const AO_UMBER = [0.3, 0.18, 0.08, 0];
const UMBER = hexToRgb("#4a3626");
const JITTER_LEVELS = 5;
const JITTER_SPAN = 0.08;

export function meshVoxels(model: VoxelModel): MeshResult {
  const dims = [model.nx, model.ny, model.nz];
  const accs = new Map<MatClass, GeoAcc>();
  const acc = (c: MatClass) => {
    let a = accs.get(c);
    if (!a) {
      a = new GeoAcc();
      accs.set(c, a);
    }
    return a;
  };
  const emissivePts: { x: number; y: number; z: number; id: number }[] = [];

  for (let z = 0; z < model.nz; z++)
    for (let y = 0; y < model.ny; y++)
      for (let x = 0; x < model.nx; x++) {
        const id = model.get(x, y, z);
        if (id && BLOCK_DEFS[id].mat === "glow")
          emissivePts.push({ x, y, z, id });
      }

  const solid = (p: number[]) => model.get(p[0], p[1], p[2]) !== 0;

  for (let d = 0; d < 3; d++) {
    const u = (d + 1) % 3;
    const v = (d + 2) % 3;
    const nu = dims[u];
    const nv = dims[v];

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
          const emptyD = a !== 0 ? s : s - 1;
          const blockPos = a !== 0 ? [...pa] : [...pb];

          const m = i + nu * j;
          const q = [0, 0, 0];
          const solidAt = (du: number, dv: number) => {
            q[d] = emptyD;
            q[u] = i + du;
            q[v] = j + dv;
            return solid(q) ? 1 : 0;
          };
          const corners: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
          let aoPack = 0;
          for (let c = 0; c < 4; c++) {
            const [ca, cb] = corners[c];
            const side1 = solidAt(ca ? 1 : -1, 0);
            const side2 = solidAt(0, cb ? 1 : -1);
            const diag = solidAt(ca ? 1 : -1, cb ? 1 : -1);
            const ao = side1 && side2 ? 0 : 3 - (side1 + side2 + diag);
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
          maskKey[m] =
            1 | (id << 1) | ((sign > 0 ? 1 : 0) << 8) | (aoPack << 9) | (jitter << 17);
          any = true;
        }

      if (!any) continue;

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

  const groups: MeshGroups = {};
  for (const [cls, a] of accs) groups[cls] = a.buffers();

  return { groups, halos: clusterHalos(emissivePts) };

  function emitQuad(
    id: number,
    d: number, u: number, v: number,
    s: number, i: number, j: number, w: number, h: number,
    sign: number,
    ao: number[],
    jitter: number
  ) {
    const def = BLOCK_DEFS[id];
    const cls: MatClass = def.mat ?? "matte";
    const out = acc(cls);
    const isGlow = cls === "glow";

    const dirName =
      (sign > 0 ? "+" : "-") + (d === 0 ? "x" : d === 1 ? "y" : "z");
    const tint = FACE_TINT[dirName];

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
        // glow: uniform HDR-ready color (material boosts past 1.0 for bloom)
        const e = def.emissive ?? 0.5;
        return [
          srgbToLinear(Math.min(1, base[0] * (0.8 + e * 0.4))),
          srgbToLinear(Math.min(1, base[1] * (0.8 + e * 0.4))),
          srgbToLinear(Math.min(1, base[2] * (0.8 + e * 0.4))),
        ] as [number, number, number];
      }
      const mult = tint.mult * AO_MULT[a] * jitterMult;
      const umberMix = Math.min(1, tint.umber + AO_UMBER[a]);
      return [
        srgbToLinear(mix(base[0] * mult, UMBER[0], umberMix)),
        srgbToLinear(mix(base[1] * mult, UMBER[1], umberMix)),
        srgbToLinear(mix(base[2] * mult, UMBER[2], umberMix)),
      ] as [number, number, number];
    });

    const flip = ao[0] + ao[2] < ao[1] + ao[3];
    let tri: number[][];
    if (sign > 0) {
      tri = flip ? [[1, 2, 3], [1, 3, 0]] : [[0, 1, 2], [0, 2, 3]];
    } else {
      tri = flip ? [[1, 3, 2], [1, 0, 3]] : [[0, 2, 1], [0, 3, 2]];
    }
    for (const t of tri)
      for (const k of t) out.push(pts[k], normal, vColors[k]);
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
