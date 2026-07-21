import type { Content } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS, EXP_EXTRA_OFFSET } from "./layout";
import { BUILT_REALMS, BUILT_ISLANDS } from "./registry";
import type { TourStop } from "./store";

/**
 * The guided tour, in order — pure cinematography now (narrator cut):
 * framing, holds, and showcase reveals carry the story.
 * Data-driven from the résumé so an APEX feed with new projects still tours.
 */


export { BUILT_REALMS };

export function buildStops(content: Content): TourStop[] {
  const stops: TourStop[] = [];
  const hub = REALMS.hub.pos;

  // — Hub: a single establishing shot —
  stops.push({
    id: "hub-welcome",
    realm: "hub",
    cam: [hub[0] + 34, hub[1] + 28, hub[2] + 46],
    target: [hub[0], hub[1] + 6, hub[2]],
    holdMs: 4200,
  });

  // — Projects: one framed showcase per island —
  const projRealm = REALMS.projects.pos;
  for (const proj of content.projects) {
    const offset = PROJECT_ISLAND_OFFSETS[proj.slug];
    if (!offset) continue;
    if (!(BUILT_ISLANDS as readonly string[]).includes(proj.slug)) continue;
    const p: [number, number, number] = [
      projRealm[0] + offset[0],
      projRealm[1] + offset[1],
      projRealm[2] + offset[2],
    ];
    // Campus Cab sits east of its siblings — shoot it from the south-west
    // so the other two islands stay out of frame; the rest from the south-east
    const cab = proj.slug === "campuscab";
    stops.push({
      id: `${proj.slug}-showcase`,
      realm: "projects",
      cam: cab
        ? [p[0] + 4, p[1] + 26, p[2] + 72]
        : [p[0] + 48, p[1] + 30, p[2] + 56],
      target: [p[0], p[1] + 6, p[2]],
      showcase: proj.slug,
      holdMs: 6000,
    });
  }

  // — Experience: one frame for the work, one for the extra-curriculars —
  const e = REALMS.experience.pos;
  const ex: [number, number, number] = [
    e[0] + EXP_EXTRA_OFFSET[0],
    e[1] + EXP_EXTRA_OFFSET[1],
    e[2] + EXP_EXTRA_OFFSET[2],
  ];
  stops.push(
    {
      id: "exp-work",
      realm: "experience",
      cam: [e[0] + 46, e[1] + 32, e[2] + 54],
      target: [e[0], e[1] + 6, e[2]],
      showcase: "#work",
      holdMs: 6000,
    },
    {
      id: "exp-extra",
      realm: "experience",
      cam: [ex[0] + 34, ex[1] + 22, ex[2] + 52],
      target: [ex[0], ex[1] + 6, ex[2]],
      showcase: "#volunteer",
      holdMs: 6000,
    }
  );

  // — Achievements: one framed showcase —
  const a = REALMS.achievements.pos;
  stops.push({
    id: "ach-hall",
    realm: "achievements",
    cam: [a[0] + 42, a[1] + 30, a[2] + 50],
    target: [a[0], a[1] + 6, a[2]],
    showcase: "#awards",
    holdMs: 6000,
  });

  // — Contact: the final, centered frame — the journey ends here —
  const b = REALMS.about.pos;
  stops.push({
    id: "about-contact",
    realm: "about",
    cam: [b[0], b[1] + 26, b[2] + 58],
    target: [b[0], b[1] + 6, b[2]],
    showcase: "#contact",
    holdMs: 8000,
  });

  return stops.filter((s) =>
    (BUILT_REALMS as readonly string[]).includes(s.realm)
  );
}
