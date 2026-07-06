import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";

/**
 * Villager builders — profession-folk of the Experience realm.
 * Bodies are static; heads (and the smith's hammer arm) are separate
 * models so realms can animate them. All silent, all charming.
 */

export type VillagerKind =
  | "smith" // Windflow AI-smith: steel apron, goggles
  | "librarian" // IIT Patna scholar: teal robe, flat cap
  | "orator" // TEDx: crimson robe, holds a mic
  | "bard" // Yavanika dramatics: two-tone robe
  | "helper"; // NSS: green robe, bandana

const ROBE: Record<VillagerKind, { main: number; trim: number }> = {
  smith: { main: B.steelDark, trim: B.copper },
  librarian: { main: B.bannerTeal, trim: B.paper },
  orator: { main: B.bannerCrimson, trim: B.goldMetal },
  bard: { main: B.bookBlue, trim: B.bookRed },
  helper: { main: B.bookGreen, trim: B.white },
};

const SKIN = B.sand;

/** robe body with folded arms — 7w × 8h × 5d, feet at y=0 */
export function buildVillagerBody(kind: VillagerKind): VoxelModel {
  const { main, trim } = ROBE[kind];
  const m = new VoxelModel(7, 8, 5);
  // robe: slight trapezoid
  m.fill(2, 0, 1, 4, 0, 3, main); // hem
  m.fill(2, 1, 1, 4, 4, 3, main);
  m.fill(2, 5, 1, 4, 6, 3, main); // chest
  // trim stripe down the front
  m.fill(3, 1, 3, 3, 5, 3, trim);
  // folded arms across the chest
  m.fill(1, 4, 2, 5, 4, 3, main);
  m.set(1, 4, 3, SKIN); // hands peeking
  m.set(5, 4, 3, SKIN);
  // shoulders
  m.fill(2, 6, 1, 4, 6, 3, main);
  return m;
}

/** big villager head — nose, eyes, per-profession headgear. 5×5×5 */
export function buildVillagerHead(kind: VillagerKind): VoxelModel {
  const m = new VoxelModel(5, 6, 5);
  // head block
  m.fill(1, 0, 1, 3, 3, 3, SKIN);
  // the nose (essential)
  m.set(2, 1, 4, SKIN);
  // eyes
  m.set(1, 2, 4, B.black);
  m.set(3, 2, 4, B.black);
  // unibrow
  m.fill(1, 3, 4, 3, 3, 4, B.wood);

  switch (kind) {
    case "smith": // goggles up on the forehead
      m.fill(1, 3, 4, 3, 3, 4, B.copper);
      m.set(1, 3, 4, B.glass);
      m.set(3, 3, 4, B.glass);
      m.fill(1, 4, 1, 3, 4, 3, B.steelDark); // work cap
      break;
    case "librarian": // flat scholar cap + button
      m.fill(0, 4, 0, 4, 4, 4, B.bannerTeal);
      m.set(2, 5, 2, B.goldMetal);
      break;
    case "orator": // neat hair
      m.fill(1, 4, 1, 3, 4, 3, B.black);
      m.fill(1, 3, 1, 3, 3, 1, B.black);
      break;
    case "bard": // half-mask (comedy/tragedy split face)
      m.set(1, 2, 4, B.white);
      m.fill(1, 4, 1, 3, 4, 3, B.bookRed); // dramatic beret
      m.set(4, 4, 2, B.white); // feather
      break;
    case "helper": // bandana
      m.fill(1, 4, 1, 3, 4, 3, B.bookGreen);
      m.set(4, 3, 2, B.bookGreen); // knot
      break;
  }
  return m;
}

/** the smith's hammer arm — swings onto the anvil */
export function buildHammerArm(): VoxelModel {
  const m = new VoxelModel(2, 5, 2);
  m.fill(0, 2, 0, 0, 4, 0, B.steelDark); // sleeve
  m.set(0, 1, 0, SKIN); // hand
  m.fill(0, 0, 0, 1, 0, 1, B.steel); // hammer head
  return m;
}

/** the orator's mic hand */
export function buildMicArm(): VoxelModel {
  const m = new VoxelModel(2, 4, 2);
  m.fill(0, 2, 0, 0, 3, 0, B.bannerCrimson); // sleeve
  m.set(0, 1, 0, SKIN);
  m.set(0, 0, 0, B.black); // the mic
  return m;
}
