import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, lampPost, flowers } from "@/lib/voxel/kit";

/**
 * Meridian — the map-observatory island. Hero structure: a stone watchtower
 * with a copper dome + brass telescope, overlooking a living map-table of
 * the world's energy routes, fed by glowing redstone supply lines.
 */

export const MERIDIAN_TOP = 26;

const SIZE = 64;
const TX = 26; // tower center x
const TZ = 26; // tower center z
const Y = MERIDIAN_TOP;

/** model-local anchor points (for creatures/screens placed by the realm) */
export const MERIDIAN_POI = {
  foxPerch: [42, Y + 3, 40] as [number, number, number],
  screen: [16, Y + 1, 47] as [number, number, number],
};

export function buildMeridianIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 60, SIZE);

  island(m, 32, 33, { topY: Y, rx: 21, rz: 18, seed: 777, depth: 20 });

  buildTower(m);
  buildMapTable(m);
  buildSupplyLines(m);
  buildScreen(m);

  // greenery
  tree(m, 48, Y + 1, 26, 21, "m");
  tree(m, 18, Y + 1, 20, 22, "s");
  tree(m, 44, Y + 1, 46, 23, "s");
  lampPost(m, 38, Y + 1, 20);
  lampPost(m, 22, Y + 1, 42);
  flowers(
    m, 12, 14, 52, 52,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    31, 0.04
  );

  return m;
}

// — the observatory tower —
function buildTower(m: VoxelModel): void {
  // tapered stone shaft
  m.cylinder(TX, Y + 1, Y + 7, TZ, 5.4, B.stone);
  m.cylinder(TX, Y + 8, Y + 13, TZ, 4.8, B.stone);
  m.cylinder(TX, Y + 14, Y + 16, TZ, 4.4, B.stoneDark);
  // hollow it
  m.cylinder(TX, Y + 2, Y + 15, TZ, 3.2, B.air);

  // door arch (front, +z)
  m.fill(TX - 1, Y + 1, TZ + 4, TX + 1, Y + 3, TZ + 5, B.air);
  m.set(TX - 1, Y + 4, TZ + 5, B.wood);
  m.set(TX + 1, Y + 4, TZ + 5, B.wood);
  m.set(TX, Y + 4, TZ + 5, B.woodLight);
  // warm light spilling from the door
  m.set(TX, Y + 1, TZ + 3, B.amber);

  // window pairs per floor — glowing at dusk
  for (const wy of [Y + 6, Y + 10, Y + 14]) {
    m.set(TX - 5, wy, TZ, B.gold);
    m.set(TX + 5, wy, TZ, B.gold);
    m.set(TX, wy, TZ - 5, B.gold);
    if (wy !== Y + 6) m.set(TX, wy, TZ + 5, B.gold);
  }

  // balcony ring
  m.ring(TX, Y + 12, TZ, 5.8, B.woodLight);
  m.ring(TX, Y + 13, TZ, 5.8, B.wood);

  // copper observatory dome
  const domeY = Y + 17;
  m.ellipsoid(TX, domeY, TZ, 6, 2.2, 6, B.copper);
  m.ellipsoid(TX, domeY + 2, TZ, 4.6, 2.6, 4.6, B.copper);
  m.ellipsoid(TX, domeY + 4, TZ, 2.6, 1.6, 2.6, B.copper);
  // observation slit (front)
  m.fill(TX, domeY + 1, TZ + 1, TX, domeY + 4, TZ + 6, B.air);
  m.fill(TX - 1, domeY + 2, TZ + 2, TX + 1, domeY + 3, TZ + 5, B.air);

  // brass telescope, aimed up toward the sun (+x, +y)
  for (let i = 0; i < 7; i++) {
    const bx = TX + i;
    const by = domeY + 2 + Math.round(i * 0.7);
    m.fill(bx, by, TZ, bx, by + 1, TZ, i > 4 ? B.bronze : B.slate);
    if (i > 4) m.set(bx, by + 1, TZ, B.crystal);
  }

  // spiral stair hint wrapping the shaft
  for (let i = 0; i < 14; i++) {
    const ang = i * 0.55;
    const sx = Math.round(TX + Math.cos(ang) * 6.1);
    const sz = Math.round(TZ + Math.sin(ang) * 6.1);
    m.set(sx, Y + 1 + i, sz, B.woodLight);
  }

  // banner + beacon on the dome
  m.set(TX, domeY + 6, TZ, B.wood);
  m.set(TX, domeY + 7, TZ, B.bannerTeal);
  m.set(TX, domeY + 8, TZ, B.redstone);
}

// — the living map table —
function buildMapTable(m: VoxelModel): void {
  // 15×11 raised table at (36..50, 36..46)
  const x0 = 36, x1 = 50, z0 = 35, z1 = 45;
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.wood); // legs/base
  m.fill(x0 - 1, Y + 2, z0 - 1, x1 + 1, Y + 2, z1 + 1, B.woodLight); // rim
  // the sea
  m.fill(x0, Y + 2, z0, x1, Y + 2, z1, B.water);
  // continents (little archipelagos)
  m.fill(x0 + 1, Y + 2, z0 + 1, x0 + 4, Y + 2, z0 + 3, B.grass);
  m.fill(x0 + 2, Y + 2, z0 + 4, x0 + 3, Y + 2, z0 + 5, B.grass);
  m.fill(x1 - 4, Y + 2, z1 - 3, x1 - 1, Y + 2, z1 - 1, B.grassDark);
  m.fill(x1 - 3, Y + 2, z0 + 1, x1 - 1, Y + 2, z0 + 2, B.sand);
  m.fill(x0 + 6, Y + 2, z0 + 4, x0 + 8, Y + 2, z0 + 6, B.grass);
  // glowing trade routes across the sea
  m.line(x0 + 4, Y + 2, z0 + 2, x1 - 3, Y + 2, z0 + 2, B.redstone);
  m.line(x0 + 3, Y + 2, z0 + 5, x1 - 2, Y + 2, z1 - 2, B.redstone);
  m.line(x0 + 7, Y + 2, z0 + 6, x0 + 7, Y + 2, z1 - 1, B.amber);
  // tiny ships
  m.set(x0 + 5, Y + 3, z0 + 2, B.copper);
  m.set(x1 - 5, Y + 3, z1 - 3, B.copper);
  m.set(x0 + 7, Y + 3, z0 + 8, B.white);
}

// — redstone supply lines to depots —
function buildSupplyLines(m: VoxelModel): void {
  // from tower base out to two depots
  routeLine(m, TX + 4, TZ + 2, 43, 22, B.redstone);
  routeLine(m, TX + 2, TZ + 4, 30, 46, B.redstone);

  depot(m, 45, 21);
  depot(m, 29, 48);
}

function routeLine(m: VoxelModel, x0: number, z0: number, x1: number, z1: number, b: number): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const z = Math.round(z0 + (z1 - z0) * t);
    if (m.get(x, Y, z) !== 0) m.set(x, Y + 1, z, b);
  }
}

function depot(m: VoxelModel, x: number, z: number): void {
  m.fill(x - 1, Y + 1, z - 1, x + 1, Y + 1, z + 1, B.stoneDark);
  m.fill(x - 1, Y + 2, z - 1, x, Y + 3, z, B.woodLight); // crates
  m.set(x + 1, Y + 2, z + 1, B.wood);
  m.set(x + 1, Y + 4, z - 1, B.gold); // lamp
  m.set(x + 1, Y + 2, z - 1, B.wood);
  m.set(x + 1, Y + 3, z - 1, B.wood);
}

// — the showcase screen (glowing panel in a wooden frame) —
function buildScreen(m: VoxelModel): void {
  const [sx, sy, sz] = MERIDIAN_POI.screen;
  // legs
  m.set(sx - 3, sy, sz, B.wood);
  m.set(sx + 3, sy, sz, B.wood);
  // frame
  m.fill(sx - 4, sy + 1, sz, sx + 4, sy + 6, sz, B.wood);
  // screen face
  m.fill(sx - 3, sy + 2, sz, sx + 3, sy + 5, sz, B.screen);
  // little antenna
  m.set(sx + 4, sy + 7, sz, B.redstone);
}

/** the map-fox — curled on its perch by the map table */
export function buildFox(): VoxelModel {
  const m = new VoxelModel(7, 5, 5);
  // body (lying, along x)
  m.ellipsoid(3, 1.4, 2, 2.6, 1.4, 1.6, B.foxOrange);
  // head at +x
  m.ellipsoid(5.4, 2.2, 2, 1.4, 1.2, 1.3, B.foxOrange);
  // white snout + chest
  m.set(6, 2, 2, B.white);
  m.set(4, 1, 2, B.white);
  // ears with black tips
  m.set(5, 4, 1, B.foxOrange);
  m.set(5, 4, 3, B.foxOrange);
  // eyes
  m.set(6, 3, 1, B.black);
  m.set(6, 3, 3, B.black);
  // paws tucked
  m.set(2, 0, 1, B.foxOrange);
  m.set(2, 0, 3, B.foxOrange);
  return m;
}

/** fox tail — separate mesh so it can wag */
export function buildFoxTail(): VoxelModel {
  const m = new VoxelModel(4, 2, 2);
  m.fill(0, 0, 0, 2, 0, 1, B.foxOrange);
  m.set(3, 0, 0, B.white);
  m.set(3, 0, 1, B.white);
  m.set(1, 1, 0, B.foxOrange);
  return m;
}
