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

  // — Experience village: forge → study → stage —
  const e = REALMS.experience.pos;
  stops.push(
    {
      id: "exp-village",
      realm: "experience",
      cam: [e[0] + 36, e[1] + 22, e[2] + 44],
      target: [e[0], e[1] + 8, e[2]],
      kip: [e[0] + 10, e[1] + 14, e[2] + 16],
      holdMs: 3400,
    },
    {
      id: "exp-forge",
      realm: "experience",
      cam: [e[0] - 3, e[1] + 11, e[2] + 18],
      target: [e[0] - 10, e[1] + 4, e[2] - 8],
      kip: [e[0] - 4, e[1] + 8, e[2] + 3],
      showcase: "#work",
      holdMs: 6800,
    },
    {
      id: "exp-study",
      realm: "experience",
      cam: [e[0] + 19, e[1] + 8, e[2] + 10],
      target: [e[0] + 11, e[1] + 4, e[2] - 6],
      kip: [e[0] + 14, e[1] + 7, e[2] + 2],
      showcase: "#education",
      holdMs: 5400,
    },
    {
      id: "exp-stage",
      realm: "experience",
      cam: [e[0], e[1] + 14, e[2] + 37],
      target: [e[0], e[1] + 4, e[2] + 13],
      kip: [e[0] - 7, e[1] + 9, e[2] + 24],
      showcase: "#volunteer",
      holdMs: 6200,
    }
  );

  // — Hall of Achievements —
  const a = REALMS.achievements.pos;
  stops.push(
    {
      id: "ach-hall",
      realm: "achievements",
      cam: [a[0] + 26, a[1] + 16, a[2] + 34],
      target: [a[0], a[1] + 7, a[2]],
      kip: [a[0] + 8, a[1] + 12, a[2] + 12],
      holdMs: 3200,
    },
    {
      id: "ach-trophies",
      realm: "achievements",
      cam: [a[0] + 1, a[1] + 11, a[2] + 27],
      target: [a[0], a[1] + 5, a[2] + 0],
      kip: [a[0] + 6, a[1] + 8, a[2] + 14],
      showcase: "#awards",
      holdMs: 7000,
    }
  );

  // — About: home, then the signposts —
  const b = REALMS.about.pos;
  stops.push(
    {
      id: "about-home",
      realm: "about",
      cam: [b[0] + 24, b[1] + 14, b[2] + 30],
      target: [b[0], b[1] + 6, b[2]],
      kip: [b[0] + 10, b[1] + 4, b[2] - 3], // hovering by his tiny house
      holdMs: 3600,
    },
    {
      id: "about-contact",
      realm: "about",
      cam: [b[0] - 4, b[1] + 9, b[2] + 26],
      target: [b[0] - 6, b[1] + 4, b[2] + 8],
      kip: [b[0] - 1, b[1] + 8, b[2] + 15],
      showcase: "#contact",
      holdMs: 8000,
    }
  );

  return stops.filter((s) =>
    (BUILT_REALMS as readonly string[]).includes(s.realm)
  );
}
