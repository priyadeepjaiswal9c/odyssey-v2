import type { RealmId } from "./store";

/**
 * Three-free world facts, importable from eager UI (start menu)
 * without dragging the 3D chunk into the main bundle.
 */

/** realms that have built geometry */
export const BUILT_REALMS = [
  "hub",
  "projects",
  "experience",
  "achievements",
  "about",
] as const;

/** project islands with real geometry */
export const BUILT_ISLANDS = ["meridian", "tark", "campuscab"] as const;

export const REALM_LABELS: Record<RealmId, string> = {
  hub: "The Hub",
  projects: "Projects",
  experience: "Experience",
  achievements: "Achievements",
  about: "About",
};
