import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, lampPost, flowers, fence } from "@/lib/voxel/kit";

/**
 * The About island — home base. A cozy timber cottage, a mailbox with
 * its flag up, social signposts (clickable), a garden pond, and a
 * Kip-sized house with its own tiny lamp. Come say hi.
 */

export const ABOUT_TOP = 24;

const SIZE = 52;
const Y = ABOUT_TOP;
const CX = 26;
const CZ = 26;

/** model-local anchors — the realm places link hotspots on the signs */
export const ABOUT_POI = {
  mailbox: [33, Y + 1, 34] as [number, number, number],
  signGitHub: [18, Y + 1, 36] as [number, number, number],
  signLinkedIn: [15, Y + 1, 32] as [number, number, number],
  signEmail: [21, Y + 1, 39] as [number, number, number],
  kipHouse: [36, Y + 1, 22] as [number, number, number],
};

export function buildAboutIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 60, SIZE);

  island(m, CX, CZ, { topY: Y, rx: 18, rz: 16, seed: 4040, depth: 18 });

  buildCottage(m);
  buildMailbox(m);
  buildSigns(m);
  buildGarden(m);
  buildKipHouse(m);

  tree(m, 12, Y + 1, 20, 91, "m");
  tree(m, 40, Y + 1, 36, 92, "s");
  lampPost(m, 30, Y + 1, 36);
  flowers(
    m, 10, 10, 42, 42,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    93, 0.05
  );

  return m;
}

// — the cottage —
function buildCottage(m: VoxelModel): void {
  const x0 = 20, x1 = 32, z0 = 18, z1 = 28;

  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.stone);
  for (let y = Y + 2; y <= Y + 6; y++) m.walls(x0, y, z0, x1, y, z1, B.woodLight);
  // timber frame corners
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as const)
    m.fill(cx, Y + 2, cz, cx, Y + 6, cz, B.wood);
  // door (+z, facing the garden) with porch light
  m.fill(25, Y + 2, z1, 26, Y + 4, z1, B.air);
  m.set(25, Y + 5, z1, B.warmLight);
  // windows all around, lit from inside
  for (const wx of [22, 29]) m.set(wx, Y + 4, z1, B.glassLit);
  m.set(x0, Y + 4, 23, B.glassLit);
  m.set(x1, Y + 4, 23, B.glassLit);
  // hollow + hearth
  m.fill(x0 + 1, Y + 2, z0 + 1, x1 - 1, Y + 6, z1 - 1, B.air);
  m.set(28, Y + 2, z0 + 2, B.amber); // the hearth
  // roof + chimney
  m.gableRoof(x0, z0, x1, z1, Y + 7, B.roofRed, 1);
  m.fill(29, Y + 7, z0 + 3, 30, Y + 11, z0 + 4, B.stoneDark);

  // porch
  m.fill(23, Y + 1, z1 + 1, 28, Y + 1, z1 + 3, B.wood);
}

// — mailbox, flag up (there's always mail worth reading) —
function buildMailbox(m: VoxelModel): void {
  const [x, y, z] = ABOUT_POI.mailbox;
  m.fill(x, y, z, x, y + 1, z, B.wood);
  m.fill(x - 1, y + 2, z, x + 1, y + 2, z, B.steelDark);
  m.set(x - 1, y + 3, z, B.warning); // the little flag
}

// — social signposts (the realm makes these clickable) —
function buildSigns(m: VoxelModel): void {
  const signs = [
    { pos: ABOUT_POI.signGitHub, accent: B.black },
    { pos: ABOUT_POI.signLinkedIn, accent: B.bookBlue },
    { pos: ABOUT_POI.signEmail, accent: B.bannerCrimson },
  ];
  for (const { pos, accent } of signs) {
    const [x, y, z] = pos;
    m.fill(x, y, z, x, y + 2, z, B.wood);
    m.fill(x - 1, y + 2, z, x + 1, y + 3, z, B.woodLight);
    m.set(x, y + 4, z, accent);
    m.set(x + 1, y + 4, z, B.amber); // sign light
  }
}

// — garden: pond, fence, veggie patch —
function buildGarden(m: VoxelModel): void {
  // pond
  m.fill(36, Y, 28, 40, Y, 32, B.water);
  m.set(35, Y, 30, B.water);
  m.set(38, Y + 1, 27, B.sand);
  // fenced veggie patch
  fence(m, 12, Y + 1, 26, 18, 26);
  fence(m, 12, Y + 1, 30, 18, 30);
  m.fill(13, Y, 27, 17, Y, 29, B.dirt);
  for (let x = 13; x <= 17; x += 2) m.set(x, Y + 1, 28, B.leaves);
}

// — Kip's tiny house (a critter needs a home) —
function buildKipHouse(m: VoxelModel): void {
  const [x, y, z] = ABOUT_POI.kipHouse;
  m.fill(x - 1, y, z - 1, x + 1, y + 1, z + 1, B.woodLight);
  m.set(x, y, z + 1, B.black); // round-ish door
  m.set(x - 1, y + 2, z, B.roofRed);
  m.set(x, y + 2, z, B.roofRed);
  m.set(x + 1, y + 2, z, B.roofRed);
  m.set(x, y + 3, z, B.kipGlow); // his little beacon
}
