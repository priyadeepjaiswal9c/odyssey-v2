import * as THREE from "three";
import type { RealmId } from "./store";

/**
 * World geography — every realm anchored far enough apart that fog +
 * on-demand mounting keep only one realm in view/memory at a time.
 * 1 voxel = 1 world unit.
 */

export const SUN_DIR = new THREE.Vector3(0.82, 0.42, 0.2).normalize();

export const SKY = {
  zenith: "#453164",
  high: "#7d5386",
  horizon: "#e08a86",
  glowBand: "#ff9e64",
  sun: "#ffe9c4",
  fog: "#c17d8e",
} as const;

export interface RealmAnchor {
  id: RealmId;
  label: string;
  /** world position of the realm's ground center */
  pos: [number, number, number];
}

export const REALMS: Record<RealmId, RealmAnchor> = {
  hub: { id: "hub", label: "The Hub", pos: [0, 0, 0] },
  projects: { id: "projects", label: "Projects", pos: [-150, 0, -90] },
  experience: { id: "experience", label: "Experience", pos: [160, 0, -100] },
  achievements: { id: "achievements", label: "Achievements", pos: [10, 8, -230] },
  about: { id: "about", label: "About", pos: [140, -4, 130] },
};

/** island offsets inside the Projects realm, keyed by project slug */
export const PROJECT_ISLAND_OFFSETS: Record<string, [number, number, number]> = {
  meridian: [0, 0, 0],
  tark: [-52, 9, -34],
  campuscab: [46, -7, -30],
};

export function realmVec(id: RealmId): THREE.Vector3 {
  return new THREE.Vector3(...REALMS[id].pos);
}
