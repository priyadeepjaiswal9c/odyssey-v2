import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, lampPost, flowers } from "@/lib/voxel/kit";

/**
 * The Experience village — professions as places:
 *  - Windflow AI-forge (NW): obsidian-and-steel lab-forge, glowing neural
 *    core, anvil, server totem, cable runs. The smith works here.
 *  - IIT Patna study (NE): little stone library with a reading lectern.
 *  - Extracurricular stage (S): timber stage, curtain backdrop — mic spot,
 *    masks post, and a sapling garden for the NSS helper.
 */

export const EXP_TOP = 26;

const SIZE = 80;
const Y = EXP_TOP;

/** model-local villager + camera anchors */
export const EXP_POI = {
  smith: [30, Y + 1, 32] as [number, number, number],
  anvil: [33, Y + 1, 32] as [number, number, number],
  librarian: [52, Y + 1, 33] as [number, number, number],
  orator: [34, Y + 2, 53] as [number, number, number],
  bard: [40, Y + 2, 55] as [number, number, number],
  helper: [48, Y + 1, 54] as [number, number, number],
};

export function buildExperienceIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, 40, 40, { topY: Y, rx: 28, rz: 24, seed: 2020, depth: 24 });

  buildSquare(m);
  buildForge(m);
  buildLibrary(m);
  buildStage(m);

  // village flavor
  cottage(m, 58, 44, B.roofRed);
  tree(m, 18, Y + 1, 44, 81, "m");
  tree(m, 62, Y + 1, 24, 82, "s");
  tree(m, 24, Y + 1, 56, 83, "s");
  lampPost(m, 40, Y + 1, 32);
  lampPost(m, 30, Y + 1, 46);
  lampPost(m, 50, Y + 1, 46);
  flowers(
    m, 14, 16, 66, 62,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    91, 0.025
  );

  // paths radiating from the square
  path(m, 40, 40, 31, 33); // to forge
  path(m, 40, 40, 52, 34); // to library
  path(m, 40, 40, 40, 52); // to stage
  path(m, 40, 40, 57, 45); // to cottage

  return m;
}

// — village square: a well + notice board —
function buildSquare(m: VoxelModel): void {
  m.fill(37, Y, 37, 43, Y, 43, B.stone);
  // the well
  m.walls(39, Y + 1, 39, 41, Y + 1, 41, B.stoneDark);
  m.set(40, Y + 1, 40, B.water);
  m.set(39, Y + 2, 39, B.wood);
  m.set(41, Y + 2, 41, B.wood);
  m.fill(39, Y + 3, 39, 41, Y + 3, 41, B.roofSlate);
  // notice board
  m.fill(36, Y + 1, 37, 36, Y + 2, 37, B.wood);
  m.fill(35, Y + 3, 37, 37, Y + 4, 37, B.paper);
}

// — the Windflow AI-forge: lab meets smithy —
function buildForge(m: VoxelModel): void {
  const x0 = 24, x1 = 36, z0 = 24, z1 = 32;

  // obsidian shell, open working face (+z)
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.concreteDark);
  for (let y = Y + 2; y <= Y + 6; y++) m.walls(x0, y, z0, x1, y, z1, B.obsidian);
  m.fill(x0 + 3, Y + 2, z1, x1 - 3, Y + 5, z1, B.air); // open front
  // steel lintel + roof
  m.fill(x0, Y + 7, z0, x1, Y + 7, z1, B.steelDark);
  m.fill(x0 + 1, Y + 8, z0 + 1, x1 - 1, Y + 8, z1 - 1, B.steel);

  // the neural core: a glowing lattice heart in the back wall
  m.fill(28, Y + 3, z0 + 1, 32, Y + 5, z0 + 1, B.power);
  m.set(30, Y + 4, z0 + 1, B.warning);
  m.walls(27, Y + 2, z0, 33, Y + 2, z0 + 2, B.steelDark);

  // chimney venting warm light
  m.fill(x0 + 2, Y + 8, z0 + 2, x0 + 3, Y + 12, z0 + 3, B.obsidian);
  m.set(x0 + 2, Y + 13, z0 + 2, B.amber);

  // anvil out front
  const [ax, , az] = EXP_POI.anvil;
  m.fill(ax - 1, Y + 1, az, ax + 1, Y + 1, az, B.steelDark);
  m.set(ax, Y + 2, az, B.steel);

  // server totem: stacked units with blinking faces
  m.fill(x1 - 2, Y + 1, z0 + 2, x1 - 1, Y + 5, z0 + 3, B.steelDark);
  m.set(x1 - 2, Y + 2, z0 + 3, B.signalGreen);
  m.set(x1 - 2, Y + 4, z0 + 3, B.power);
  m.set(x1 - 1, Y + 3, z0 + 3, B.warning);

  // holo-screen leaning by the door
  m.fill(x0 + 1, Y + 2, z1 - 1, x0 + 1, Y + 4, z1 - 1, B.screen);

  // cable run from core to totem
  m.line(30, Y + 6, z0 + 1, x1 - 2, Y + 6, z0 + 2, B.copper);
}

// — the IIT Patna study: stone library + lectern —
function buildLibrary(m: VoxelModel): void {
  const x0 = 48, x1 = 58, z0 = 24, z1 = 31;

  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.stone);
  for (let y = Y + 2; y <= Y + 5; y++) m.walls(x0, y, z0, x1, y, z1, B.stone);
  // book window: shelves visible from outside
  for (let x = x0 + 2; x <= x1 - 2; x++) {
    const pick = [B.bookRed, B.bookBlue, B.bookGreen, B.paper][x % 4];
    m.set(x, Y + 3, z1, pick);
    m.set(x, Y + 4, z1, [B.bookGreen, B.paper, B.bookRed, B.bookBlue][x % 4]);
  }
  // door + warm light
  m.fill(52, Y + 2, z1, 53, Y + 3, z1, B.air);
  m.set(52, Y + 4, z1, B.warmLight);
  m.fill(x0 + 1, Y + 2, z0 + 1, x1 - 1, Y + 5, z1 - 1, B.air);
  m.set(53, Y + 3, 27, B.warmLight); // reading light inside
  // slate roof
  m.gableRoof(x0, z0, x1, z1, Y + 6, B.roofSlate, 1);

  // reading lectern outside (the librarian's post)
  m.fill(51, Y + 1, 34, 51, Y + 2, 34, B.wood);
  m.fill(50, Y + 3, 34, 52, Y + 3, 34, B.woodLight);
  m.set(51, Y + 4, 34, B.paper); // the open book
}

// — the extracurricular stage —
function buildStage(m: VoxelModel): void {
  const x0 = 30, x1 = 50, z0 = 50, z1 = 58;

  // timber stage platform
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.woodLight);
  // curtain backdrop wall at the REAR (audience looks from +z)
  for (let y = Y + 2; y <= Y + 7; y++)
    m.fill(x0, y, z0, x1, y, z0, y === Y + 7 ? B.goldMetal : B.bannerCrimson);
  // curtain folds (darker stripes)
  for (let x = x0 + 2; x <= x1 - 2; x += 4)
    m.fill(x, Y + 2, z0, x, Y + 6, z0, B.bookRed);
  // stage steps down toward the audience
  m.fill(38, Y + 1, z1 + 1, 42, Y + 1, z1 + 1, B.wood);

  // mic stand (TEDx spot)
  m.fill(36, Y + 2, 53, 36, Y + 3, 53, B.steelDark);
  m.set(36, Y + 4, 53, B.black);

  // theater masks post (Yavanika spot)
  m.fill(42, Y + 2, 56, 42, Y + 5, 56, B.wood);
  m.set(41, Y + 4, 56, B.white); // comedy
  m.set(43, Y + 4, 56, B.black); // tragedy
  m.set(42, Y + 6, 56, B.trophyGold);

  // sapling garden (NSS spot) — off-stage, hands in the soil
  m.fill(46, Y, 52, 50, Y, 56, B.dirt);
  for (const [sx, sz] of [[47, 53], [49, 55], [48, 52]] as const) {
    m.set(sx, Y + 1, sz, B.wood);
    m.set(sx, Y + 2, sz, B.leaves);
  }
  m.set(50, Y + 1, 53, B.water); // watering pail

  // stage footlights along the audience edge
  for (let x = x0 + 3; x <= x1 - 3; x += 5) m.set(x, Y + 1, z1, B.warmLight);
}

// — a flavor cottage —
function cottage(m: VoxelModel, cx: number, cz: number, roof: number): void {
  const x0 = cx - 4, x1 = cx + 4, z0 = cz - 3, z1 = cz + 3;
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.stone);
  for (let y = Y + 2; y <= Y + 5; y++) m.walls(x0, y, z0, x1, y, z1, B.woodLight);
  m.fill(cx, Y + 2, z1, cx, Y + 3, z1, B.air);
  m.set(cx - 2, Y + 3, z1, B.glassLit);
  m.set(cx + 2, Y + 3, z1, B.glassLit);
  m.gableRoof(x0, z0, x1, z1, Y + 6, roof, 1);
}

/** stamp a sandy path between two points */
function path(m: VoxelModel, x0: number, z0: number, x1: number, z1: number): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const z = Math.round(z0 + (z1 - z0) * t);
    if (m.get(x, Y, z) === B.grass || m.get(x, Y, z) === B.grassDark)
      m.set(x, Y, z, B.sand);
  }
}
