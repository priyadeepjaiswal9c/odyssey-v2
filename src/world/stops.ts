import type { Resume } from "@/content/types";
import { REALMS, PROJECT_ISLAND_OFFSETS } from "./layout";
import type { TourStop } from "./store";

/**
 * The guided tour, in order. Stops are data-driven from the résumé where
 * possible so an APEX feed with new projects still tours correctly.
 * Kip's lines: warm, funny, Priyadeep's voice.
 */

/** realms that have built geometry — P2/P3 extend this */
export const BUILT_REALMS = ["hub", "projects"] as const;

const PROJECT_LINES: Record<string, { approach: string; showcase: string }> = {
  meridian: {
    approach:
      "First stop: Meridian! He taught a flock of AI agents to babysit the world's energy supply chains. The fox supervises. Mostly naps.",
    showcase:
      "Four live data feeds, three sim engines, one very busy map. A crisis comes in, reroutes go out — sanctions-checked, naturally. ✦",
  },
  tark: {
    approach:
      "The great library of TARK! An AI lawyer that argues with itself — one model drafts, another fact-checks. The owl takes minutes.",
    showcase:
      "Generator drafts, Challenger objects. Six legal templates that typeset themselves into real PDFs. Order in the court!",
  },
  campuscab: {
    approach:
      "All aboard! Campus Cab — ride-pooling for IIT Patna. Fuzzy search so good it forgives your spelling at 8:59 AM.",
    showcase:
      "Nine hundred lines of tidy MVC, three search modes, SHA-256 at the door. The cart-critter has never once missed a festival.",
  },
};

const DEFAULT_PROJECT_LINES = {
  approach: "Ooh, a new island! He builds fast — I barely finished the lanterns.",
  showcase: "Fresh from the workshop. Have a look — links are on the panel!",
};

export function buildStops(resume: Resume): TourStop[] {
  const stops: TourStop[] = [];
  const hub = REALMS.hub.pos;

  // — Hub —
  stops.push({
    id: "hub-welcome",
    realm: "hub",
    cam: [hub[0] + 24, hub[1] + 19, hub[2] + 30],
    target: [hub[0], hub[1] + 7, hub[2]],
    kip: [hub[0] + 4, hub[1] + 10, hub[2] + 8],
    line: `Oh! A visitor! I'm Kip — resident glow-bug, tour guide, and Priyadeep's hype-creature. Welcome to Kalpana ✦`,
    holdMs: 2600,
  });
  stops.push({
    id: "hub-shrine",
    realm: "hub",
    cam: [hub[0] - 14, hub[1] + 12, hub[2] + 18],
    target: [hub[0], hub[1] + 5, hub[2]],
    kip: [hub[0] - 2, hub[1] + 9, hub[2] + 3],
    line: "This little cosmos is his résumé. Four realms float out there — projects, professions, trophies, and home. Shall we wander?",
    holdMs: 2200,
  });

  // — Projects (only islands that exist in both the feed and the world) —
  const projRealm = REALMS.projects.pos;
  for (const proj of resume.projects) {
    const offset = PROJECT_ISLAND_OFFSETS[proj.slug];
    if (!offset) continue; // unknown island — no geometry yet
    const p: [number, number, number] = [
      projRealm[0] + offset[0],
      projRealm[1] + offset[1],
      projRealm[2] + offset[2],
    ];
    const lines = PROJECT_LINES[proj.slug] ?? DEFAULT_PROJECT_LINES;
    stops.push({
      id: `${proj.slug}-approach`,
      realm: "projects",
      cam: [p[0] + 34, p[1] + 20, p[2] + 40],
      target: [p[0], p[1] + 9, p[2]],
      kip: [p[0] + 8, p[1] + 14, p[2] + 14],
      line: lines.approach,
      holdMs: 2400,
    });
    stops.push({
      id: `${proj.slug}-showcase`,
      realm: "projects",
      // outside the island rim, looking across the set piece toward the hero
      cam: [p[0] + 30, p[1] + 15, p[2] + 42],
      target: [p[0] + 2, p[1] + 6, p[2] + 2],
      kip: [p[0] + 12, p[1] + 11, p[2] + 16],
      line: lines.showcase,
      showcase: proj.slug,
      holdMs: 5200,
    });
  }

  return stops.filter((s) =>
    (BUILT_REALMS as readonly string[]).includes(s.realm)
  );
}
