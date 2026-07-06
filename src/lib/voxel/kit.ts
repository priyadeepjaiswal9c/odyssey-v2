import { B } from "./palette";
import { rng } from "./rng";
import type { VoxelModel } from "./model";

/**
 * The voxel building kit — shared vocabulary for every realm.
 * All functions are deterministic given their seed.
 */

export interface IslandOpts {
  /** grass top y-level */
  topY: number;
  rx: number;
  rz: number;
  seed: number;
  /** how deep the rocky underbelly hangs */
  depth?: number;
  grass?: number;
  soil?: number;
}

/** A floating island: noisy grass plateau + tapering rocky underbelly. */
export function island(m: VoxelModel, cx: number, cz: number, o: IslandOpts): void {
  const r = rng(o.seed);
  const depth = o.depth ?? Math.max(o.rx, o.rz) * 1.1;
  const grass = o.grass ?? B.grass;
  const soil = o.soil ?? B.dirt;

  // build column by column so the silhouette is organic
  for (let x = Math.floor(cx - o.rx); x <= Math.ceil(cx + o.rx); x++) {
    for (let z = Math.floor(cz - o.rz); z <= Math.ceil(cz + o.rz); z++) {
      const dx = (x - cx) / o.rx;
      const dz = (z - cz) / o.rz;
      const d2 = dx * dx + dz * dz;
      if (d2 > 1) continue;
      const edge = Math.sqrt(1 - d2); // 1 at center → 0 at rim
      // wobble the rim so it's not a perfect ellipse
      const wob = 0.82 + 0.18 * hashNoise(x, z, o.seed);
      if (edge < (1 - wob) * 0.9) continue;

      // top: slight dome (±1) with occasional raised knolls
      const topBump = edge > 0.75 && hashNoise(x + 31, z - 17, o.seed) > 0.82 ? 1 : 0;
      const top = o.topY + topBump;

      // bottom: taper toward a rough point
      const hang = Math.round(depth * Math.pow(edge * wob, 1.6) * (0.75 + 0.5 * hashNoise(x - 7, z + 13, o.seed)));
      const bottom = o.topY - 2 - hang;

      for (let y = bottom; y <= top; y++) {
        let b: number;
        if (y === top) b = grass;
        else if (y >= top - 2) b = soil;
        else b = hashNoise(x + y, z - y, o.seed) > 0.72 ? B.stoneDark : B.stone;
        m.set(x, y, z, b);
      }
      // grass lip drooping over the rim
      if (edge < 0.35 && r() > 0.5) m.set(x, o.topY - 1, z, grass === B.grass ? B.grassDark : grass);
    }
  }
}

/** deterministic 2D-ish noise in [0,1] from ints */
function hashNoise(x: number, z: number, seed: number): number {
  let h = (x * 374761393 + z * 668265263 + seed * 69069) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** A golden-hour tree: trunk + blobby autumn canopy. */
export function tree(m: VoxelModel, x: number, y: number, z: number, seed: number, size: "s" | "m" | "l" = "m"): void {
  const r = rng(seed);
  const h = size === "s" ? 3 : size === "m" ? 5 : 7;
  const cr = size === "s" ? 2 : size === "m" ? 3 : 4;
  m.fill(x, y, z, x, y + h - 1, z, B.wood);
  const leaf = r() > 0.8 ? B.leavesCoral : B.leaves;
  const leafDark = leaf === B.leaves ? B.leavesDark : B.leaves;
  // canopy: stacked squashed spheres with jitter
  m.ellipsoid(x, y + h + cr - 1, z, cr + 0.6, cr, cr + 0.6, leaf);
  m.ellipsoid(x + (r() > 0.5 ? 1 : -1), y + h + cr - 2, z + (r() > 0.5 ? 1 : -1), cr - 0.4, cr - 0.6, cr - 0.4, leafDark);
  // a few dangling leaves
  for (let i = 0; i < 3; i++) {
    const lx = x + Math.round((r() - 0.5) * cr * 2);
    const lz = z + Math.round((r() - 0.5) * cr * 2);
    m.set(lx, y + h - 1 + Math.round(r() * 2), lz, leaf);
  }
}

/** A warm lamp post. */
export function lampPost(m: VoxelModel, x: number, y: number, z: number, height = 4): void {
  m.fill(x, y, z, x, y + height - 1, z, B.wood);
  m.set(x, y + height, z, B.gold);
  m.set(x, y + height + 1, z, B.wood);
}

/** Scatter flowers/grass tufts on a surface region. */
export function flowers(m: VoxelModel, x0: number, z0: number, x1: number, z1: number, yOf: (x: number, z: number) => number, seed: number, density = 0.06): void {
  const r = rng(seed);
  const picks = [B.leavesCoral, B.white, B.bookRed, B.sand];
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      if (r() > density) continue;
      const y = yOf(x, z);
      if (y < 0) continue;
      m.set(x, y, z, picks[Math.floor(r() * picks.length)]);
    }
}

/** simple picket fence run along x or z */
export function fence(m: VoxelModel, x0: number, y: number, z0: number, x1: number, z1: number): void {
  const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
  const len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  for (let i = 0; i <= len; i++) {
    const x = alongX ? x0 + Math.sign(x1 - x0) * i : x0;
    const z = alongX ? z0 : z0 + Math.sign(z1 - z0) * i;
    m.set(x, y, z, B.woodLight);
    if (i % 2 === 0) m.set(x, y + 1, z, B.woodLight);
  }
}
