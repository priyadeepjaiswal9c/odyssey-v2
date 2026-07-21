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
  orator: [26, Y + 2, 54] as [number, number, number],
  bard: [40, Y + 2, 55] as [number, number, number],
  helper: [55, Y + 1, 53] as [number, number, number],
};

/** the work island — Windflow forge + IIT Patna study, breathing room */
export function buildExperienceIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, 40, 40, { topY: Y, rx: 26, rz: 22, seed: 2020, depth: 24 });

  buildSquare(m);
  buildForge(m);
  buildLibrary(m);

  // village flavor
  cottage(m, 56, 48, B.roofRed);
  tree(m, 18, Y + 1, 44, 81, "m");
  tree(m, 62, Y + 1, 24, 82, "s");
  tree(m, 24, Y + 1, 54, 83, "s");
  lampPost(m, 40, Y + 1, 32);
  lampPost(m, 30, Y + 1, 46);
  lampPost(m, 50, Y + 1, 46);
  flowers(
    m, 14, 16, 66, 60,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    91, 0.025
  );

  // paths radiating from the square
  path(m, 40, 40, 31, 33); // to forge
  path(m, 40, 40, 52, 34); // to library
  path(m, 40, 40, 55, 47); // to cottage

  // striped market awnings — each chapter reads as a signed shop-stall
  shopAwning(m, 26, 34, 32, Y + 6, B.bannerCrimson, B.paper); // Windflow
  shopAwning(m, 49, 57, 31, Y + 5, B.bookBlue, B.paper); // IIT Patna

  return m;
}

/**
 * The extra-curricular island — its own small world: TEDx speaking stage,
 * the Yavanika theatre, and the NSS service post around a green.
 */
export function buildExtraIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 64, SIZE);

  island(m, 40, 40, { topY: Y, rx: 24, rz: 20, seed: 2121, depth: 22 });

  // fanned toward the visitor (+x/+z camera) so all three read at once
  buildYavanikaTheatre(m, 28, 42); // theatre stage-left
  buildTedxStage(m, 52, 42); // red dais stage-right
  buildNssPost(m, 40, 26); // service post upstage center

  // a small green between the three
  tree(m, 18, Y + 1, 30, 84, "m");
  tree(m, 62, Y + 1, 30, 85, "s");
  lampPost(m, 40, Y + 1, 42);
  flowers(
    m, 16, 20, 62, 58,
    (x, z) => (m.get(x, Y, z) === B.grass ? Y + 1 : -1),
    92, 0.03
  );

  // paths joining the three posts
  path(m, 40, 42, 34, 46); // to the theatre
  path(m, 40, 42, 52, 46); // to the TEDx dais
  path(m, 40, 42, 40, 30); // to the NSS post

  return m;
}

/** a striped market awning + stall posts over a shopfront */
function shopAwning(
  m: VoxelModel,
  x0: number,
  x1: number,
  z: number,
  y: number,
  cA: number,
  cB: number
): void {
  for (let x = x0; x <= x1; x++) {
    const c = x % 2 === 0 ? cA : cB;
    m.set(x, y, z + 1, c);
    m.set(x, y - 1, z + 2, c); // slopes out over the front
    m.set(x, y - 2, z + 2, c); // valance fringe
  }
  // support posts + a crate and a lantern at the stall
  m.fill(x0, Y + 1, z + 2, x0, y - 1, z + 2, B.wood);
  m.fill(x1, Y + 1, z + 2, x1, y - 1, z + 2, B.wood);
  m.set(x0 + 1, Y + 1, z + 2, B.woodLight);
  m.set(x0 + 2, Y + 1, z + 2, B.woodLight);
  m.set(x1 - 1, Y + 2, z + 2, B.warmLight);
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

// TEDx — an open speaking-stage: red dais, arch, spotlight, mic
function buildTedxStage(m: VoxelModel, cx: number, z0: number): void {
  const z1 = z0 + 8;
  // round-ish red dais
  m.fill(cx - 4, Y + 1, z0 + 2, cx + 4, Y + 1, z1 - 2, B.bannerCrimson);
  m.fill(cx - 3, Y + 2, z0 + 3, cx + 3, Y + 2, z1 - 3, B.bookRed);
  // steel arch over the dais
  for (let y = Y + 2; y <= Y + 8; y++) {
    m.set(cx - 5, y, z0 + 4, B.steelDark);
    m.set(cx + 5, y, z0 + 4, B.steelDark);
  }
  m.fill(cx - 5, Y + 9, z0 + 4, cx + 5, Y + 9, z0 + 4, B.steelDark);
  // spotlight hanging from the arch, aimed at the speaker
  m.set(cx, Y + 8, z0 + 4, B.warmLight);
  // mic stand
  m.fill(cx, Y + 3, z0 + 4, cx, Y + 4, z0 + 4, B.steelDark);
  m.set(cx, Y + 5, z0 + 4, B.black);
  // audience benches
  for (const bz of [z1, z1 + 1]) m.fill(cx - 4, Y + 1, bz + 1, cx + 4, Y + 1, bz + 1, B.wood);
}

// Yavanika — a proper little theatre: proscenium box, curtains, masks
function buildYavanikaTheatre(m: VoxelModel, x0: number, z0: number): void {
  const x1 = x0 + 12, z1 = z0 + 9;
  // stage floor + enclosing side walls + rear
  m.fill(x0, Y + 1, z0, x1, Y + 1, z1, B.woodLight);
  for (let y = Y + 2; y <= Y + 8; y++) {
    m.set(x0, y, z0, B.wood);
    m.set(x1, y, z0, B.wood);
    m.fill(x0, y, z0, x1, y, z0, y === Y + 8 ? B.goldMetal : B.bannerCrimson);
  }
  // curtain folds
  for (let x = x0 + 2; x <= x1 - 2; x += 3)
    m.fill(x, Y + 2, z0, x, Y + 7, z0, B.bookRed);
  // proscenium arch framing the front
  for (let y = Y + 2; y <= Y + 9; y++) {
    m.set(x0, y, z1, B.wood);
    m.set(x1, y, z1, B.wood);
  }
  m.fill(x0, Y + 9, z0, x1, Y + 9, z1, B.roofSlate); // roof slab
  m.fill(x0, Y + 8, z1, x1, Y + 8, z1, B.goldMetal); // marquee rail
  // comedy/tragedy masks over the arch
  m.set(x0 + 4, Y + 7, z1, B.white);
  m.set(x0 + 8, Y + 7, z1, B.black);
  // footlights
  for (let x = x0 + 2; x <= x1 - 2; x += 3) m.set(x, Y + 1, z1, B.warmLight);
}

// NSS — a community-service post: kiosk, banner, garden plot, tools
function buildNssPost(m: VoxelModel, cx: number, cz: number): void {
  // little kiosk with an awning
  m.fill(cx - 2, Y + 1, cz - 2, cx + 2, Y + 1, cz + 2, B.stone);
  for (let y = Y + 2; y <= Y + 4; y++) m.walls(cx - 2, y, cz - 2, cx + 2, y, cz + 2, B.woodLight);
  m.fill(cx - 1, Y + 2, cz + 2, cx + 1, Y + 3, cz + 2, B.air); // open counter
  m.fill(cx - 3, Y + 5, cz - 3, cx + 3, Y + 5, cz + 3, B.bookGreen); // awning
  m.set(cx, Y + 6, cz, B.white); // service banner pole cap
  // banner pole with green service flag
  m.fill(cx + 4, Y + 1, cz - 3, cx + 4, Y + 7, cz - 3, B.wood);
  m.fill(cx + 3, Y + 6, cz - 3, cx + 3, Y + 7, cz - 3, B.bookGreen);
  // garden plot the helper tends
  m.fill(cx - 5, Y, cz + 3, cx - 1, Y, cz + 6, B.dirt);
  for (const [sx, sz] of [[cx - 4, cz + 4], [cx - 2, cz + 5], [cx - 3, cz + 3]] as const) {
    m.set(sx, Y + 1, sz, B.wood);
    m.set(sx, Y + 2, sz, B.leaves);
  }
  m.set(cx - 1, Y + 1, cz + 4, B.water); // watering pail
  m.set(cx - 2, Y + 2, cz - 2, B.warmLight); // kiosk lamp
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
