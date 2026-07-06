import type { Resume } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS } from "./layout";
import { BUILT_REALMS, BUILT_ISLANDS } from "./registry";
import type { TourStop } from "./store";

/**
 * The guided tour, in order — pure cinematography now (narrator cut):
 * framing, holds, and showcase reveals carry the story.
 * Data-driven from the résumé so an APEX feed with new projects still tours.
 */


export { BUILT_REALMS };

export function buildStops(resume: Resume): TourStop[] {
  const stops: TourStop[] = [];
  const hub = REALMS.hub.pos;

  // — Hub: establishing shot, then the shrine up close —
  stops.push({
    id: "hub-welcome",
    realm: "hub",
    cam: [hub[0] + 24, hub[1] + 19, hub[2] + 30],
    target: [hub[0], hub[1] + 7, hub[2]],
    kip: [hub[0] + 4, hub[1] + 10, hub[2] + 8],
    holdMs: 3600,
  });
  stops.push({
    id: "hub-shrine",
    realm: "hub",
    // approach over the pond — clear sightline to the wayshrine
    cam: [hub[0] + 12, hub[1] + 11, hub[2] + 20],
    target: [hub[0], hub[1] + 5, hub[2]],
    kip: [hub[0] + 3, hub[1] + 9, hub[2] + 5],
    holdMs: 3000,
  });

  // — Projects (islands present in both feed and world) —
  const projRealm = REALMS.projects.pos;
  for (const proj of resume.projects) {
    const offset = PROJECT_ISLAND_OFFSETS[proj.slug];
    if (!offset) continue;
    if (!(BUILT_ISLANDS as readonly string[]).includes(proj.slug)) continue;
    const p: [number, number, number] = [
      projRealm[0] + offset[0],
      projRealm[1] + offset[1],
      projRealm[2] + offset[2],
    ];
    stops.push({
      id: `${proj.slug}-approach`,
      realm: "projects",
      cam: [p[0] + 34, p[1] + 20, p[2] + 40],
      target: [p[0], p[1] + 9, p[2]],
      kip: [p[0] + 8, p[1] + 14, p[2] + 14],
      holdMs: 3400,
    });
    stops.push({
      id: `${proj.slug}-showcase`,
      realm: "projects",
      cam: [p[0] + 30, p[1] + 15, p[2] + 42],
      target: [p[0] + 2, p[1] + 6, p[2] + 2],
      kip: [p[0] + 12, p[1] + 11, p[2] + 16],
      showcase: proj.slug,
      holdMs: 7000,
    });
  }

  return stops.filter((s) =>
    (BUILT_REALMS as readonly string[]).includes(s.realm)
  );
}
