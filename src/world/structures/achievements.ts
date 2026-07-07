import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree } from "@/lib/voxel/kit";

/**
 * The Monument Hall — warm beacon beams over engraved stone plinths,
 * emissive medals that bloom, a reflective polished floor, and Monocraft
 * nameplates (realm-side). A hall of honor, not floating cartoon cups.
 */

export const ACH_TOP = 26;

const SIZE = 60;
const Y = ACH_TOP;
const CX = 30;
const CZ = 30;

/** plinth positions (model-local) for n awards — realm places beams + names */
export function plinthPositions(n: number): [number, number, number][] {
  const count = Math.max(1, Math.min(n, 6));
  const out: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.PI * 0.22 + (i / Math.max(1, count - 1)) * Math.PI * 0.56;
    out.push([
      Math.round(CX + Math.cos(a) * 10),
      Y,
      Math.round(CZ + Math.sin(a) * 10),
    ]);
  }
  return out;
}

export function buildAchievementsIsland(nAwards: number): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, CX, CZ, { topY: Y, rx: 20, rz: 17, seed: 3030, depth: 20 });

  // — polished floor: marble disc with a gloss inlay ring (reflector sits above) —
  m.cylinder(CX, Y, Y, CZ, 14, B.marble);
  m.ring(CX, Y, CZ, 11, B.obsidian);
  m.cylinder(CX, Y, Y, CZ, 8, B.marble);

  // — rear colonnade with gilded capitals + architrave —
  const nCols = 7;
  for (let i = 0; i < nCols; i++) {
    const a = Math.PI + (i / (nCols - 1)) * Math.PI;
    const x = Math.round(CX + Math.cos(a) * 12);
    const z = Math.round(CZ + Math.sin(a) * 12) - 2;
    if (z > CZ) continue;
    m.fill(x, Y + 1, z, x, Y + 7, z, B.marble);
    m.set(x, Y + 8, z, B.goldMetal);
  }
  for (let i = 0; i < 40; i++) {
    const a = Math.PI + (i / 39) * Math.PI;
    const x = Math.round(CX + Math.cos(a) * 12);
    const z = Math.round(CZ + Math.sin(a) * 12) - 2;
    if (z > CZ) continue;
    m.set(x, Y + 9, z, B.marble);
  }

  // — central eternal flame: obsidian bowl, blooming heart —
  m.fill(CX - 2, Y + 1, CZ - 2, CX + 2, Y + 1, CZ + 2, B.obsidian);
  m.fill(CX - 1, Y + 2, CZ - 1, CX + 1, Y + 2, CZ + 1, B.marble);
  m.set(CX, Y + 3, CZ, B.goldMetal);
  m.set(CX, Y + 4, CZ, B.warmLight);

  // — engraved plinths, one per award —
  for (const [px, , pz] of plinthPositions(nAwards)) {
    // stepped stone base
    m.fill(px - 1, Y + 1, pz - 1, px + 1, Y + 1, pz + 1, B.stoneDark);
    m.fill(px - 1, Y + 2, pz - 1, px + 1, Y + 3, pz + 1, B.marble);
    // engraving band (obsidian inlay = carved look)
    m.fill(px - 1, Y + 2, pz + 1, px + 1, Y + 2, pz + 1, B.obsidian);
    // capstone + the medal that blooms
    m.fill(px - 1, Y + 4, pz - 1, px + 1, Y + 4, pz + 1, B.stoneDark);
    m.set(px, Y + 5, pz, B.goldMetal); // stand
    m.set(px, Y + 6, pz, B.trophyGold); // emissive medal
  }

  // laurel trees + brazier pair at the entrance
  tree(m, CX - 14, Y + 1, CZ + 8, 71, "s");
  tree(m, CX + 14, Y + 1, CZ + 8, 72, "s");
  for (const bx of [CX - 5, CX + 5]) {
    m.fill(bx, Y + 1, CZ + 13, bx, Y + 2, CZ + 13, B.obsidian);
    m.set(bx, Y + 3, CZ + 13, B.amber);
  }

  return m;
}
