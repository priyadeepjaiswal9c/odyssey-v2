import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree } from "@/lib/voxel/kit";

/**
 * The Hall of Achievements — an open marble pantheon in the sky.
 * A semicircular colonnade cradles a grand central trophy; each award
 * gets its own pedestal in the forecourt. Gold, marble, glow.
 */

export const ACH_TOP = 26;

const SIZE = 60;
const Y = ACH_TOP;
const CX = 30;
const CZ = 30;

export function buildAchievementsIsland(nAwards: number): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, CX, CZ, { topY: Y, rx: 20, rz: 17, seed: 3030, depth: 20 });

  // — marble terrace —
  m.cylinder(CX, Y, Y, CZ, 14, B.marble);
  m.cylinder(CX, Y, Y, CZ, 9, B.stone);
  m.cylinder(CX, Y, Y, CZ, 8, B.marble);

  // — semicircular colonnade at the rear (−z half) —
  const nCols = 7;
  for (let i = 0; i < nCols; i++) {
    const a = Math.PI + (i / (nCols - 1)) * Math.PI; // rear half-circle
    const x = Math.round(CX + Math.cos(a) * 12);
    const z = Math.round(CZ + Math.sin(a) * 12) - 2;
    if (z > CZ) continue; // only the rear arc
    m.fill(x, Y + 1, z, x, Y + 7, z, B.marble);
    m.set(x, Y + 8, z, B.goldMetal); // gilded capitals
  }
  // architrave arc connecting the columns
  for (let i = 0; i < 40; i++) {
    const a = Math.PI + (i / 39) * Math.PI;
    const x = Math.round(CX + Math.cos(a) * 12);
    const z = Math.round(CZ + Math.sin(a) * 12) - 2;
    if (z > CZ) continue;
    m.set(x, Y + 9, z, B.marble);
  }

  // — the grand central trophy —
  m.fill(CX - 2, Y + 1, CZ - 2, CX + 2, Y + 1, CZ + 2, B.marble);
  m.fill(CX - 1, Y + 2, CZ - 1, CX + 1, Y + 2, CZ + 1, B.obsidian);
  m.set(CX, Y + 3, CZ, B.goldMetal); // stem
  m.fill(CX - 1, Y + 4, CZ - 1, CX + 1, Y + 5, CZ + 1, B.trophyGold); // bowl
  m.set(CX - 2, Y + 5, CZ, B.goldMetal); // handles
  m.set(CX + 2, Y + 5, CZ, B.goldMetal);
  m.set(CX, Y + 6, CZ, B.warmLight); // the flame of glory

  // — award pedestals in an arc across the forecourt (+z) —
  const n = Math.max(1, Math.min(nAwards, 6));
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 0.25 + (i / Math.max(1, n - 1)) * Math.PI * 0.5;
    const x = Math.round(CX + Math.cos(a) * 10);
    const z = Math.round(CZ + Math.sin(a) * 10);
    pedestal(m, x, z, i);
  }

  // laurel trees flanking the entrance
  tree(m, CX - 14, Y + 1, CZ + 8, 71, "s");
  tree(m, CX + 14, Y + 1, CZ + 8, 72, "s");

  // twin braziers lighting the steps
  for (const bx of [CX - 5, CX + 5]) {
    m.fill(bx, Y + 1, CZ + 13, bx, Y + 2, CZ + 13, B.obsidian);
    m.set(bx, Y + 3, CZ + 13, B.amber);
  }

  return m;
}

/** one award pedestal — trophy style varies by index */
function pedestal(m: VoxelModel, x: number, z: number, i: number): void {
  // marble column with a gold band
  m.fill(x - 1, Y + 1, z - 1, x + 1, Y + 1, z + 1, B.marble);
  m.fill(x, Y + 2, z, x, Y + 3, z, B.marble);
  m.set(x, Y + 2, z + 1, B.goldMetal);

  switch (i % 4) {
    case 0: // gold cup (Amazon MLSS)
      m.set(x, Y + 4, z, B.goldMetal);
      m.fill(x - 1, Y + 5, z, x + 1, Y + 5, z, B.trophyGold);
      m.set(x, Y + 6, z, B.warmLight);
      break;
    case 1: // silver medal on a stand (JEE Advanced)
      m.set(x, Y + 4, z, B.wood);
      m.set(x, Y + 5, z, B.silver);
      m.set(x, Y + 6, z, B.bannerCrimson); // ribbon
      break;
    case 2: // gold medal (JEE Mains)
      m.set(x, Y + 4, z, B.wood);
      m.set(x, Y + 5, z, B.goldMetal);
      m.set(x, Y + 6, z, B.bannerTeal);
      break;
    case 3: // bronze theater mask (Inter-IIT stageplay)
      m.set(x, Y + 4, z, B.bronze);
      m.fill(x - 1, Y + 5, z, x + 1, Y + 6, z, B.bronze);
      m.set(x - 1, Y + 6, z + 1, B.black); // eyes
      m.set(x + 1, Y + 6, z + 1, B.black);
      break;
  }
}
