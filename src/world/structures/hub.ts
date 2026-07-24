import { VoxelModel } from "@/lib/voxel/model";
import { B } from "@/lib/voxel/palette";
import { island, tree, lampPost, flowers } from "@/lib/voxel/kit";
import type { RealmId } from "../store";

/**
 * The Hub — spawn island. A warm wayshrine, four realm signposts,
 * a pond, paths, autumn trees. Everything radiates from the beacon.
 */

export const HUB_TOP = 22; // grass level in model coords

const SIZE = 44;
const C = SIZE / 2; // 22

/** model-local positions of the four realm signs (click targets) */
export const HUB_SIGNS: Record<
  Exclude<RealmId, "hub">,
  { pos: [number, number, number]; banner: number }
> = {
  projects: { pos: [C - 11, HUB_TOP + 1, C - 7], banner: B.bannerTeal },
  experience: { pos: [C + 11, HUB_TOP + 1, C - 7], banner: B.bannerCrimson },
  achievements: { pos: [C - 1, HUB_TOP + 1, C - 12], banner: B.trophyGold },
  about: { pos: [C + 9, HUB_TOP + 1, C + 9], banner: B.leavesCoral },
};

export function buildHubIsland(): VoxelModel {
  const m = new VoxelModel(SIZE, 46, SIZE);

  island(m, C, C, { topY: HUB_TOP, rx: 15, rz: 15, seed: 4242, depth: 17 });

  const y = HUB_TOP; // grass level; structures start at y+1

  // — central wayshrine —
  // stone dais (two tiers)
  m.cylinder(C, y, y, C, 4.4, B.stone);
  m.cylinder(C, y + 1, y + 1, C, 3.2, B.stoneDark);
  // four corner pillars with lamps
  for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]] as const) {
    m.fill(C + dx, y + 1, C + dz, C + dx, y + 3, C + dz, B.woodLight);
    m.set(C + dx, y + 4, C + dz, B.gold);
  }
  // beacon: obsidian base → warm crystal spire → floating spark.
  // the heart of the home — a clear focal point, but not a blown-out flare
  m.set(C, y + 2, C, B.obsidian);
  m.fill(C, y + 3, C, C, y + 6, C, B.amber); // dimmer shaft
  m.set(C, y + 7, C, B.warmLight); // one bright core near the top
  m.set(C, y + 8, C, B.gold); // cap
  m.set(C, y + 10, C, B.gold); // floating spark
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
    m.set(C + dx, y + 3, C + dz, B.amber); // ring of light at the base

  // — pond (dug into the grass, north-east) —
  m.fill(C + 6, y, C + 4, C + 9, y, C + 7, B.water);
  m.set(C + 5, y, C + 5, B.water);
  m.set(C + 10, y, C + 6, B.water);
  m.set(C + 6, y + 1, C + 3, B.sand);
  m.set(C + 10, y + 1, C + 4, B.sand);

  // — signposts: post + board + banner per realm —
  for (const { pos, banner } of Object.values(HUB_SIGNS)) {
    const [sx, sy, sz] = pos;
    m.fill(sx, sy, sz, sx, sy + 2, sz, B.wood);
    m.fill(sx - 1, sy + 2, sz, sx + 1, sy + 3, sz, B.woodLight);
    m.set(sx, sy + 4, sz, banner);
    // little glow so signs read at dusk
    m.set(sx + 1, sy + 4, sz, B.amber);
  }

  // — paths from shrine to each sign —
  for (const { pos } of Object.values(HUB_SIGNS)) {
    pathTo(m, C, C, pos[0], pos[2], y);
  }

  // — trees + lamps + flowers (kept clear of the shrine sightlines) —
  tree(m, C - 12, y + 1, C + 10, 11, "m");
  tree(m, C + 4, y + 1, C - 10, 12, "l");
  tree(m, C - 7, y + 1, C - 8, 13, "s");
  lampPost(m, C + 6, y + 1, C + 10);
  lampPost(m, C - 12, y + 1, C + 2);
  flowers(
    m, C - 14, C - 14, C + 14, C + 14,
    (x, z) => (m.get(x, y, z) === B.grass ? y + 1 : -1),
    99, 0.05
  );

  return m;
}

/** stamp a dirt path along the straight line between two surface points */
function pathTo(m: VoxelModel, x0: number, z0: number, x1: number, z1: number, y: number): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const z = Math.round(z0 + (z1 - z0) * t);
    if (m.get(x, y, z) === B.grass || m.get(x, y, z) === B.grassDark)
      m.set(x, y, z, B.sand);
  }
}
