/**
 * Kalpana block palette — RTX golden-hour. No purple.
 * Every block belongs to a material class that maps to a PBR material:
 *  matte (default) · gloss · metal · water · glow (emissive, bloom-fed)
 */

export type MatClass = "matte" | "gloss" | "metal" | "water" | "glow";

export interface BlockDef {
  name: string;
  color: string;
  /** material class — defaults to matte */
  mat?: MatClass;
  /** 0–1 glow strength (only for mat:"glow"); scales halo + HDR boost */
  emissive?: number;
  /** skip the per-position color jitter (clean surfaces: glass, screens, water) */
  flat?: boolean;
}

const defs = [
  { name: "air", color: "#000000" },
  // — terrain —
  { name: "grass", color: "#8fb35e" },
  { name: "grassDark", color: "#79a24c" },
  { name: "dirt", color: "#9c6b4a" },
  { name: "stone", color: "#b8ab98" },
  { name: "stoneDark", color: "#94897a" },
  { name: "sand", color: "#e9d3a4" },
  { name: "water", color: "#5fb8a8", mat: "water", flat: true },
  // — wood + foliage (autumn golden-hour) —
  { name: "wood", color: "#7d5236" },
  { name: "woodLight", color: "#c08343" },
  { name: "leaves", color: "#e08c4a" },
  { name: "leavesDark", color: "#c9773e" },
  { name: "leavesCoral", color: "#e0876c" },
  // — build materials —
  { name: "roofRed", color: "#b85450", mat: "gloss" },
  { name: "roofSlate", color: "#556066", mat: "gloss" },
  { name: "white", color: "#f4ecd8" },
  { name: "marble", color: "#ece2cc", mat: "gloss" },
  { name: "black", color: "#2a2420" },
  { name: "concrete", color: "#b0a894" },
  { name: "concreteDark", color: "#847c6c" },
  { name: "obsidian", color: "#322a26", mat: "gloss" },
  { name: "paper", color: "#f0e4c8" },
  // — metals —
  { name: "steel", color: "#77808c", mat: "metal", flat: true },
  { name: "steelDark", color: "#4a525e", mat: "metal", flat: true },
  { name: "copper", color: "#c47a4e", mat: "metal" },
  { name: "bronze", color: "#b08048", mat: "metal" },
  { name: "silver", color: "#c8c8cc", mat: "metal", flat: true },
  { name: "goldMetal", color: "#d9a440", mat: "metal", flat: true },
  // — accents —
  { name: "bookRed", color: "#a84848" },
  { name: "bookBlue", color: "#4e6e8c" },
  { name: "bookGreen", color: "#5e8c5e" },
  { name: "foxOrange", color: "#d97a34" },
  { name: "bannerCrimson", color: "#a83a3a" },
  { name: "bannerTeal", color: "#3e8078" },
  { name: "glass", color: "#cfe0d8", mat: "gloss", flat: true },
  // — glows (bloom-fed) —
  { name: "gold", color: "#ffb84d", mat: "glow", emissive: 0.95, flat: true },
  { name: "amber", color: "#ff9e3d", mat: "glow", emissive: 0.6, flat: true },
  { name: "warmLight", color: "#ffdf9e", mat: "glow", emissive: 0.8, flat: true },
  { name: "power", color: "#ffb020", mat: "glow", emissive: 0.9, flat: true },
  { name: "warning", color: "#ff5f3d", mat: "glow", emissive: 0.85, flat: true },
  { name: "trophyGold", color: "#ffd060", mat: "glow", emissive: 0.45, flat: true },
  { name: "screen", color: "#bfe8d8", mat: "glow", emissive: 0.55, flat: true },
  { name: "glassLit", color: "#ffd98a", mat: "glow", emissive: 0.7, flat: true },
  { name: "signalGreen", color: "#4dd17a", mat: "glow", emissive: 0.7, flat: true },
  // — Kip —
  { name: "kipCream", color: "#f7e6c4" },
  { name: "kipGold", color: "#f0c078" },
  { name: "kipGlow", color: "#ffd98a", mat: "glow", emissive: 1, flat: true },
] as const satisfies readonly BlockDef[];

export const BLOCK_DEFS: readonly BlockDef[] = defs;

type BlockName = (typeof defs)[number]["name"];

/** name → palette index, e.g. B.grass */
export const B = Object.fromEntries(
  defs.map((d, i) => [d.name, i])
) as Record<BlockName, number>;
