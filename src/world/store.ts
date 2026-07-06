import { create } from "zustand";

export type RealmId =
  | "hub"
  | "projects"
  | "experience"
  | "achievements"
  | "about";

export type Quality = "high" | "medium" | "low";

interface WorldState {
  /** world layer running + covering the text core */
  worldActive: boolean;
  setWorldActive: (on: boolean) => void;
  /** device perf tier — set once at boot, downgradable at runtime */
  quality: Quality;
  setQuality: (q: Quality) => void;
}

export const useWorld = create<WorldState>((set) => ({
  worldActive: false,
  setWorldActive: (on) => {
    if (typeof document !== "undefined") {
      if (on) document.body.dataset.world = "on";
      else delete document.body.dataset.world;
    }
    set({ worldActive: on });
  },
  quality: "high",
  setQuality: (quality) => set({ quality }),
}));
