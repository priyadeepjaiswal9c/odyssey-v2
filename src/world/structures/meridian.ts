import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, flowers } from "@/lib/voxel/kit";

/**
 * Meridian — bespoke identity: an energy control tower + power grid.
 * Concrete-and-steel control tower with a glowing glass operations deck,
 * lattice transmission pylons marching across golden grassland, live
 * amber power lines sagging between them into a fenced substation.
 */

export const MERIDIAN_TOP = 26;

const SIZE = 64;
const Y = MERIDIAN_TOP;

/** model-local anchor points (creatures/screens placed by the realm) */
export const MERIDIAN_POI = {
  foxPerch: [47, Y + 3, 47] as [number, number, number],
  screen: [22, Y + 1, 46] as [number, number, number],
};

export function buildMeridianIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, 32, 33, { topY: Y, rx: 21, rz: 18, seed: 777, depth: 20 });

  buildControlTower(m, 20, 24);

  // pylons marching across the island, wired together
  const pylons: [number, number][] = [
    [33, 38],
    [43, 30],
    [51, 21],
  ];
  for (const [px, pz] of pylons) buildPylon(m, px, pz);
  // tower roof feed → first pylon, then pylon to pylon
  wire(m, 22, Y + 17, 26, pylons[0][0], Y + 12, pylons[0][1] - 2, 2);
  for (let i = 0; i < pylons.length - 1; i++) {
    const [ax, az] = pylons[i];
    const [bx, bz] = pylons[i + 1];
    wire(m, ax - 2, Y + 12, az, bx - 2, Y + 12, bz, 2);
    wire(m, ax + 2, Y + 12, az, bx + 2, Y + 12, bz, 2);
  }
  // last pylon drops into the substation
  wire(m, pylons[0][0], Y + 12, pylons[0][1], 45, Y + 5, 44, 1);

  buildSubstation(m, 45, 45);
  buildScreen(m);

  // golden grassland away from the steel
  tree(m, 14, Y + 1, 18, 21, "m");
  tree(m, 26, Y + 1, 14, 23, "s");
  tree(m, 44, Y + 1, 50, 24, "s");
  flowers(
    m, 12, 12, 52, 52,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    31, 0.035
  );

  return m;
}

// — the control tower: concrete shaft, glowing ops deck, radar + mast —
function buildControlTower(m: VoxelModel, tx: number, tz: number): void {
  // foundation pad
  m.fill(tx - 4, Y + 1, tz - 4, tx + 4, Y + 1, tz + 4, B.concreteDark);

  // square concrete shaft with steel bands
  for (let y = Y + 2; y <= Y + 13; y++) {
    const band = (y - Y) % 4 === 0;
    m.walls(tx - 2, y, tz - 2, tx + 2, y, tz + 2, band ? B.steelDark : B.concrete);
  }
  // door
  m.fill(tx, Y + 2, tz + 2, tx, Y + 3, tz + 2, B.black);
  m.set(tx, Y + 4, tz + 2, B.warmLight);
  // small service windows up the shaft
  for (const wy of [Y + 6, Y + 10]) m.set(tx - 2, wy, tz, B.glassLit);

  // cantilevered operations deck (wider than the shaft)
  const dy = Y + 14;
  m.fill(tx - 4, dy, tz - 4, tx + 4, dy, tz + 4, B.steelDark); // deck floor
  // glass ring with steel corner mullions
  for (let y = dy + 1; y <= dy + 2; y++) {
    m.walls(tx - 4, y, tz - 4, tx + 4, y, tz + 4, B.glassLit);
    for (const [cx, cz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]] as const)
      m.set(tx + cx, y, tz + cz, B.steel);
  }
  m.fill(tx - 4, dy + 3, tz - 4, tx + 4, dy + 3, tz + 4, B.concreteDark); // roof
  m.fill(tx - 3, dy + 4, tz - 3, tx + 3, dy + 4, tz + 3, B.concrete);

  // radar dish on the roof
  m.fill(tx - 2, dy + 5, tz - 2, tx - 1, dy + 5, tz - 1, B.steel);
  m.ellipsoid(tx - 1.5, dy + 7, tz - 1.5, 2.2, 1, 2.2, B.silver);
  m.set(tx - 1, dy + 8, tz - 1, B.steel);

  // antenna mast with aircraft-warning lights
  m.fill(tx + 2, dy + 5, tz + 2, tx + 2, dy + 9, tz + 2, B.steelDark);
  m.set(tx + 2, dy + 7, tz + 2, B.warning);
  m.set(tx + 2, dy + 10, tz + 2, B.warning);
}

// — a steel lattice transmission pylon —
function buildPylon(m: VoxelModel, px: number, pz: number): void {
  const base = Y + 1;
  const top = Y + 12;
  // four tapering legs
  for (let y = base; y <= top; y++) {
    const t = (y - base) / (top - base);
    const spread = Math.max(0, Math.round(2 * (1 - t)));
    m.set(px - spread, y, pz - spread, B.steelDark);
    m.set(px + spread, y, pz - spread, B.steelDark);
    m.set(px - spread, y, pz + spread, B.steelDark);
    m.set(px + spread, y, pz + spread, B.steelDark);
    // cross-bracing hint every few levels
    if (y % 3 === 0 && spread > 0) {
      m.fill(px - spread, y, pz - spread, px + spread, y, pz - spread, B.steel);
      m.fill(px - spread, y, pz + spread, px + spread, y, pz + spread, B.steel);
    }
  }
  // crossarm with insulators
  m.fill(px - 3, top, pz, px + 3, top, pz, B.steel);
  m.set(px - 3, top - 1, pz, B.white);
  m.set(px + 3, top - 1, pz, B.white);
  m.set(px, top + 1, pz, B.steelDark);
  m.set(px, top + 2, pz, B.warning);
}

/** a sagging power line between two points (glowing amber) */
function wire(
  m: VoxelModel,
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number,
  sag: number
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * sag;
    m.set(
      Math.round(x0 + (x1 - x0) * t),
      Math.round(y),
      Math.round(z0 + (z1 - z0) * t),
      B.power
    );
  }
}

// — fenced substation: transformers, coils, warning lights —
function buildSubstation(m: VoxelModel, sx: number, sz: number): void {
  // gravel pad
  m.fill(sx - 4, Y + 1, sz - 3, sx + 4, Y + 1, sz + 3, B.concreteDark);
  // perimeter fence
  for (let x = sx - 4; x <= sx + 4; x++) {
    if (Math.abs(x - sx) % 2 === 0) {
      m.set(x, Y + 2, sz - 3, B.steel);
      m.set(x, Y + 2, sz + 3, B.steel);
    }
  }
  for (let z = sz - 3; z <= sz + 3; z++) {
    if (Math.abs(z - sz) % 2 === 0) {
      m.set(sx - 4, Y + 2, z, B.steel);
      m.set(sx + 4, Y + 2, z, B.steel);
    }
  }
  // two transformer units with copper coils
  for (const dx of [-2, 2]) {
    m.fill(sx + dx - 1, Y + 2, sz - 1, sx + dx, Y + 4, sz, B.steelDark);
    m.set(sx + dx - 1, Y + 3, sz + 1, B.copper);
    m.set(sx + dx, Y + 3, sz + 1, B.copper);
    m.set(sx + dx - 1, Y + 5, sz - 1, B.white); // insulator
    m.set(sx + dx, Y + 5, sz, B.power); // live terminal
  }
  // corner warning lights
  m.set(sx - 4, Y + 3, sz - 3, B.warning);
  m.set(sx + 4, Y + 3, sz + 3, B.warning);
  // fox crate
  m.fill(sx + 1, Y + 2, sz + 4, sx + 2, Y + 2, sz + 5, B.woodLight);
}

// — the showcase screen: steel frame + glowing panel —
function buildScreen(m: VoxelModel): void {
  const [sx, sy, sz] = MERIDIAN_POI.screen;
  m.set(sx - 3, sy, sz, B.steelDark);
  m.set(sx + 3, sy, sz, B.steelDark);
  m.fill(sx - 4, sy + 1, sz, sx + 4, sy + 6, sz, B.steel);
  m.fill(sx - 3, sy + 2, sz, sx + 3, sy + 5, sz, B.steelDark);
  m.set(sx + 4, sy + 7, sz, B.warning);
}

/** the silent fox — curled on its crate by the substation */
export function buildFox(): VoxelModel {
  const m = new VoxelModel(7, 5, 5);
  m.ellipsoid(3, 1.4, 2, 2.6, 1.4, 1.6, B.foxOrange);
  m.ellipsoid(5.4, 2.2, 2, 1.4, 1.2, 1.3, B.foxOrange);
  m.set(6, 2, 2, B.white);
  m.set(4, 1, 2, B.white);
  m.set(5, 4, 1, B.foxOrange);
  m.set(5, 4, 3, B.foxOrange);
  m.set(6, 3, 1, B.black);
  m.set(6, 3, 3, B.black);
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
