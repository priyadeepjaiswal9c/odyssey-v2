import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, flowers } from "@/lib/voxel/kit";

/**
 * TARK — bespoke identity: a marble courthouse-library.
 * Colonnade + pediment + gold emblem in glossy marble, book-striped
 * library wings glowing warm from inside, a scroll plaza with lecterns,
 * and an owl-scribe on its perch. Justice, but cozy.
 */

export const TARK_TOP = 26;

const SIZE = 64;
const Y = TARK_TOP;

export const TARK_POI = {
  owlPerch: [24, Y + 4, 39] as [number, number, number],
  screen: [46, Y + 1, 45] as [number, number, number],
};

export function buildTarkIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, 32, 32, { topY: Y, rx: 21, rz: 18, seed: 1313, depth: 20 });

  buildCourthouse(m);
  buildPlaza(m);
  buildScreen(m);

  tree(m, 14, Y + 1, 24, 41, "s");
  tree(m, 50, Y + 1, 28, 42, "m");
  flowers(
    m, 12, 12, 52, 52,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    51, 0.03
  );

  return m;
}

// — the courthouse: steps, colonnade, pediment, book-wings —
function buildCourthouse(m: VoxelModel): void {
  const x0 = 19, x1 = 45; // footprint
  const z0 = 16, z1 = 28;

  // marble steps down to the plaza (three tiers)
  m.fill(x0 + 2, Y + 1, z1 + 1, x1 - 2, Y + 1, z1 + 4, B.marble);
  m.fill(x0 + 4, Y + 2, z1 + 1, x1 - 4, Y + 2, z1 + 2, B.marble);
  // podium the whole building stands on
  m.fill(x0, Y + 1, z0, x1, Y + 2, z1, B.marble);

  // main hall walls (stone, with book stripes on the wings)
  for (let y = Y + 3; y <= Y + 9; y++) {
    m.walls(x0 + 1, y, z0 + 1, x1 - 1, y, z1 - 1, B.stone);
  }
  // book stripes: rows of shelved books along the side wings
  for (const wy of [Y + 4, Y + 6, Y + 8]) {
    for (let z = z0 + 2; z <= z1 - 2; z++) {
      const pick = [B.bookRed, B.bookBlue, B.bookGreen, B.paper][(z + wy) % 4];
      m.set(x0 + 1, wy, z, pick);
      m.set(x1 - 1, wy, z, pick);
    }
  }
  // warm windows on the wings
  for (const wz of [z0 + 4, z0 + 8]) {
    m.set(x0 + 1, Y + 5, wz, B.glassLit);
    m.set(x1 - 1, Y + 5, wz, B.glassLit);
  }
  // interior glow spilling out the door
  m.fill(31, Y + 3, z1 - 2, 33, Y + 6, z1 - 2, B.black);
  m.set(32, Y + 3, z1 - 1, B.warmLight);
  // hollow the hall so light reads through
  m.fill(x0 + 3, Y + 3, z0 + 3, x1 - 3, Y + 8, z1 - 3, B.air);
  m.set(32, Y + 4, 22, B.warmLight); // the reading lamp inside

  // colonnade across the front
  for (const cx of [21, 25, 29, 35, 39, 43]) {
    m.fill(cx, Y + 3, z1, cx, Y + 9, z1, B.marble);
  }
  // entablature
  m.fill(x0, Y + 10, z0, x1, Y + 10, z1 + 1, B.marble);

  // pediment (stepped triangle) over the front
  for (let step = 0; step < 4; step++) {
    m.fill(
      x0 + 2 + step * 3, Y + 11 + step, z1 - 1,
      x1 - 2 - step * 3, Y + 11 + step, z1 + 1,
      B.marble
    );
  }
  // gold emblem at the pediment center
  m.fill(31, Y + 11, z1 + 1, 33, Y + 12, z1 + 1, B.trophyGold);

  // slate gable roof over the hall
  m.gableRoof(x0 + 1, z0 + 1, x1 - 1, z1 - 3, Y + 11, B.roofSlate, 0);
}

// — scroll plaza: lecterns, scroll racks, marble path —
function buildPlaza(m: VoxelModel): void {
  // marble path from steps into the plaza
  m.fill(30, Y, 33, 34, Y, 46, B.marble);

  // owl lectern
  m.fill(24, Y + 1, 39, 24, Y + 2, 39, B.wood);
  m.fill(23, Y + 3, 38, 25, Y + 3, 40, B.woodLight);

  // scroll racks: stacked paper in wooden cradles
  for (const [rx, rz] of [[40, 38], [42, 42], [21, 44]] as const) {
    m.fill(rx - 1, Y + 1, rz, rx + 1, Y + 1, rz, B.wood);
    m.fill(rx - 1, Y + 2, rz, rx + 1, Y + 3, rz, B.paper);
    m.set(rx, Y + 4, rz, B.paper);
  }

  // twin lantern posts flanking the steps
  for (const lx of [26, 38]) {
    m.fill(lx, Y + 1, 35, lx, Y + 3, 35, B.wood);
    m.set(lx, Y + 4, 35, B.warmLight);
  }
}

// — the showcase screen: marble-framed, scholarly —
function buildScreen(m: VoxelModel): void {
  const [sx, sy, sz] = TARK_POI.screen;
  m.set(sx - 3, sy, sz, B.wood);
  m.set(sx + 3, sy, sz, B.wood);
  m.fill(sx - 4, sy + 1, sz, sx + 4, sy + 6, sz, B.marble);
  m.fill(sx - 3, sy + 2, sz, sx + 3, sy + 5, sz, B.screen);
  m.set(sx, sy + 7, sz, B.trophyGold);
}

/** the owl-scribe — body (head is separate so it can swivel) */
export function buildOwlBody(): VoxelModel {
  const m = new VoxelModel(5, 5, 5);
  // plump body
  m.ellipsoid(2, 2, 2, 1.8, 2.2, 1.6, B.wood);
  // cream belly
  m.ellipsoid(2, 1.8, 3, 1, 1.4, 0.8, B.paper);
  // wing folds
  m.set(0, 2, 2, B.black);
  m.set(4, 2, 2, B.black);
  // feet
  m.set(1, 0, 2, B.bronze);
  m.set(3, 0, 2, B.bronze);
  return m;
}

/** the owl's head — big eyes, tiny tufts */
export function buildOwlHead(): VoxelModel {
  const m = new VoxelModel(5, 4, 4);
  m.ellipsoid(2, 1.4, 1.4, 2.2, 1.6, 1.6, B.wood);
  // face disc + huge eyes
  m.set(1, 2, 3, B.white);
  m.set(3, 2, 3, B.white);
  m.set(1, 1, 3, B.black);
  m.set(3, 1, 3, B.black);
  // beak
  m.set(2, 1, 3, B.bronze);
  // ear tufts
  m.set(0, 3, 1, B.black);
  m.set(4, 3, 1, B.black);
  return m;
}
