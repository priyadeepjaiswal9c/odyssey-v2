import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, flowers } from "@/lib/voxel/kit";

/**
 * Campus Cab — bespoke identity: a campus transit hub.
 * A warm timber station with a gold-faced clock tower, a full rail loop
 * circling the island (a cart-critter rides it live), platform canopy,
 * departure board, and red/green signals. All aboard.
 */

export const CAB_TOP = 26;

const SIZE = 64;
const Y = CAB_TOP;
const CX = 32;
const CZ = 33;

/** rail loop parameters — the realm animates the cart along this circle */
export const CAB_TRACK = {
  center: [CX, Y + 2, CZ] as [number, number, number],
  radius: 14,
};

export const CAB_POI = {
  screen: [18, Y + 1, 45] as [number, number, number],
};

export function buildCabIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, CX, CZ, { topY: Y, rx: 21, rz: 19, seed: 909, depth: 20 });

  buildTrack(m);
  buildStation(m);
  buildPlatform(m);
  buildSignals(m);
  buildScreen(m);

  tree(m, 14, Y + 1, 20, 61, "s");
  tree(m, 50, Y + 1, 44, 62, "s");
  flowers(
    m, 12, 12, 52, 54,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    71, 0.03
  );

  return m;
}

// — the rail loop: ties + steel rail circling the island —
function buildTrack(m: VoxelModel): void {
  const r = CAB_TRACK.radius;
  const steps = Math.ceil(2 * Math.PI * r * 1.6);
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * r);
    const z = Math.round(CZ + Math.sin(a) * r);
    // grade the ground under the track
    if (m.get(x, Y, z) === 0) continue; // off the island rim — gap, no rail
    m.set(x, Y + 1, z, i % 3 === 0 ? B.wood : B.stoneDark); // ties/ballast
    m.set(x, Y + 2, z, B.steelDark); // rail
  }
}

// — the station house + clock tower —
function buildStation(m: VoxelModel): void {
  const x0 = 25, x1 = 39, z0 = 26, z1 = 36;

  // timber walls on a stone base
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.stone);
  for (let y = Y + 2; y <= Y + 6; y++)
    m.walls(x0, y, z0, x1, y, z1, B.woodLight);
  // corner posts
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as const)
    m.fill(cx, Y + 2, cz, cx, Y + 6, cz, B.wood);

  // arched entrance facing the platform (+z)... wide and welcoming
  m.fill(30, Y + 2, z1, 34, Y + 4, z1, B.air);
  m.set(32, Y + 5, z1, B.warmLight); // lamp over the arch

  // warm windows
  for (const wx of [27, 37]) {
    m.set(wx, Y + 4, z1, B.glassLit);
    m.set(wx, Y + 4, z0, B.glassLit);
  }

  // hollow interior with a glow
  m.fill(x0 + 1, Y + 2, z0 + 1, x1 - 1, Y + 6, z1 - 1, B.air);
  m.set(32, Y + 3, 31, B.warmLight);

  // red gable roof
  m.gableRoof(x0, z0, x1, z1, Y + 7, B.roofRed, 1);

  // — clock tower at the east corner —
  const tx = 41, tz = 27;
  for (let y = Y + 1; y <= Y + 12; y++)
    m.walls(tx - 1, y, tz - 1, tx + 1, y, tz + 1, B.woodLight);
  m.fill(tx - 1, Y + 8, tz - 1, tx + 1, Y + 12, tz + 1, B.wood);
  // gold clock faces (front + platform side)
  m.fill(tx - 1, Y + 9, tz + 1, tx + 1, Y + 11, tz + 1, B.goldMetal);
  m.set(tx, Y + 10, tz + 1, B.black); // hub of the hands
  m.fill(tx + 1, Y + 9, tz - 1, tx + 1, Y + 11, tz + 1, B.goldMetal);
  m.set(tx + 1, Y + 10, tz, B.black);
  // little pyramid cap + finial
  m.fill(tx - 1, Y + 13, tz - 1, tx + 1, Y + 13, tz + 1, B.roofRed);
  m.set(tx, Y + 14, tz, B.roofRed);
  m.set(tx, Y + 15, tz, B.goldMetal);
}

// — platform with canopy along the front track —
function buildPlatform(m: VoxelModel): void {
  // platform slab between station and track
  m.fill(26, Y + 1, 38, 38, Y + 1, 44, B.stone);
  // canopy posts + slab roof over the platform edge
  for (const px of [27, 32, 37]) {
    m.fill(px, Y + 2, 43, px, Y + 5, 43, B.steel);
  }
  m.fill(25, Y + 6, 41, 39, Y + 6, 45, B.roofRed);
  // benches
  for (const bx of [29, 35]) {
    m.fill(bx, Y + 2, 39, bx + 1, Y + 2, 39, B.wood);
  }
  // hanging platform lamps under the canopy
  m.set(27, Y + 5, 44, B.warmLight);
  m.set(37, Y + 5, 44, B.warmLight);
}

// — red/green departure signals by the track —
function buildSignals(m: VoxelModel): void {
  for (const [sx, sz, go] of [[20, 38, 1], [44, 40, 0], [40, 18, 1]] as const) {
    if (m.get(sx, Y, sz) === 0) continue;
    m.fill(sx, Y + 1, sz, sx, Y + 4, sz, B.steelDark);
    m.set(sx, Y + 5, sz, go ? B.signalGreen : B.warning);
  }
}

// — the departure board / showcase screen —
function buildScreen(m: VoxelModel): void {
  const [sx, sy, sz] = CAB_POI.screen;
  m.set(sx - 3, sy, sz, B.steelDark);
  m.set(sx + 3, sy, sz, B.steelDark);
  m.fill(sx - 4, sy + 1, sz, sx + 4, sy + 6, sz, B.woodLight);
  m.fill(sx - 3, sy + 2, sz, sx + 3, sy + 5, sz, B.steelDark);
  m.set(sx - 4, sy + 7, sz, B.signalGreen);
  m.set(sx + 4, sy + 7, sz, B.warning);
}

/** the cart-critter — a minecart with eyes, forever commuting */
export function buildCart(): VoxelModel {
  const m = new VoxelModel(5, 4, 4);
  // cart shell
  m.fill(0, 1, 0, 4, 2, 3, B.steelDark);
  m.fill(1, 2, 1, 3, 2, 2, B.air); // open top
  // copper trim
  m.fill(0, 2, 0, 4, 2, 0, B.copper);
  m.fill(0, 2, 3, 4, 2, 3, B.copper);
  // big friendly eyes on the front
  m.set(4, 2, 1, B.white);
  m.set(4, 2, 2, B.white);
  // wheels
  m.set(1, 0, 0, B.black);
  m.set(3, 0, 0, B.black);
  m.set(1, 0, 3, B.black);
  m.set(3, 0, 3, B.black);
  // a little parcel passenger
  m.set(2, 2, 1, B.woodLight);
  return m;
}
