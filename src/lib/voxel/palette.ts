/**
 * Kalpana block palette — golden-hour warm.
 * Index 0 is air. `emissive` blocks render unlit + get glow halos.
 */

export interface BlockDef {
  name: string;
  color: string;
  /** 0–1; >0 renders in the unlit glow pass */
  emissive?: number;
  /** skip the per-position color jitter (for clean surfaces like screens) */
  flat?: boolean;
}

const defs = [
  { name: "air", color: "#000000" },
  // terrain
  { name: "grass", color: "#93bb6c" },
  { name: "grassDark", color: "#7da85a" },
  { name: "dirt", color: "#a9704f" },
  { name: "stone", color: "#cbb8a0" },
  { name: "stoneDark", color: "#a89680" },
  { name: "sand", color: "#f2d8a7" },
  { name: "water", color: "#7fd4c1", flat: true },
  // wood + foliage (autumn golden-hour trees)
  { name: "wood", color: "#8a5a3b" },
  { name: "woodLight", color: "#c98a4b" },
  { name: "leaves", color: "#e8975a" },
  { name: "leavesDark", color: "#d97f4e" },
  { name: "leavesPink", color: "#e89ab5" },
  // build materials
  { name: "roofRed", color: "#c65f5f" },
  { name: "roofPlum", color: "#8f5a86" },
  { name: "white", color: "#fff3dd" },
  { name: "black", color: "#3a2b45" },
  { name: "slate", color: "#6b5a7a" },
  { name: "copper", color: "#d9825f" },
  { name: "obsidian", color: "#443355" },
  { name: "paper", color: "#f7ead0" },
  // accents
  { name: "bookRed", color: "#b5495b" },
  { name: "bookBlue", color: "#5a7ab5" },
  { name: "bookGreen", color: "#6a9b6d" },
  { name: "foxOrange", color: "#e8823a" },
  { name: "bannerPurple", color: "#7a4a8f" },
  { name: "bannerTeal", color: "#4a8f85" },
  { name: "bronze", color: "#c98a52" },
  { name: "silver", color: "#dcd7e0" },
  // glows
  { name: "gold", color: "#ffb84d", emissive: 0.95 },
  { name: "amber", color: "#ff9e3d", emissive: 0.6 },
  { name: "crystal", color: "#b7e6ff", emissive: 0.55 },
  { name: "redstone", color: "#ff5f4d", emissive: 0.85 },
  { name: "trophyGold", color: "#ffcf5e", emissive: 0.4 },
  { name: "screen", color: "#9fe8e0", emissive: 0.5, flat: true },
  { name: "kipCream", color: "#ffe9c4" },
  { name: "kipGold", color: "#ffc978" },
  { name: "kipGlow", color: "#ffd98a", emissive: 1 },
] as const satisfies readonly BlockDef[];

export const BLOCK_DEFS: readonly BlockDef[] = defs;

type BlockName = (typeof defs)[number]["name"];

/** name → palette index, e.g. B.grass */
export const B = Object.fromEntries(
  defs.map((d, i) => [d.name, i])
) as Record<BlockName, number>;
