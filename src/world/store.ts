import { create } from "zustand";
import { audio } from "@/lib/audio";

export type RealmId =
  | "hub"
  | "projects"
  | "experience"
  | "achievements"
  | "about";

export type Quality = "high" | "medium" | "low";

export interface TourStop {
  id: string;
  realm: RealmId;
  /** camera position */
  cam: [number, number, number];
  /** camera lookAt */
  target: [number, number, number];
  /** where Kip hovers at this stop */
  kip: [number, number, number];
  /** project slug → showcase card in HUD */
  showcase?: string;
  /** auto-tour hold at this stop (ms) */
  holdMs?: number;
}

interface WorldState {
  // — layers —
  worldActive: boolean;
  setWorldActive: (on: boolean) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  /** start menu → world */
  phase: "menu" | "world";
  /** first gesture: unlock audio, leave the menu, optionally start touring */
  enterWorld: (dest: "tour" | RealmId) => void;

  // — audio —
  muted: boolean;
  toggleMuted: () => void;

  // — time of day —
  night: boolean;
  toggleNight: () => void;

  // — tour —
  stops: TourStop[];
  setStops: (stops: TourStop[]) => void;
  stopIndex: number;
  targetIndex: number | null; // non-null while flying
  touring: boolean;
  showcaseSlug: string | null;
  /** realms currently mounted (destination mounts before flight) */
  mounted: RealmId[];

  goTo: (index: number) => void;
  arrive: () => void;
  next: () => void;
  prev: () => void;
  startTour: () => void;
  pauseTour: () => void;
  goToRealm: (realm: RealmId) => void;
  dismissShowcase: () => void;
}

export const useWorld = create<WorldState>((set, get) => ({
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

  phase: "menu",
  enterWorld: (dest) => {
    audio.unlock();
    audio.click();
    set({ phase: "world", muted: audio.muted });
    if (dest === "tour") get().startTour();
    else if (dest !== "hub") get().goToRealm(dest);
  },

  muted: false,
  toggleMuted: () => {
    const m = !get().muted;
    audio.setMuted(m);
    set({ muted: m });
  },

  night: false,
  toggleNight: () => {
    audio.click();
    set((s) => ({ night: !s.night }));
  },

  stops: [],
  setStops: (stops) => set({ stops }),
  stopIndex: 0,
  targetIndex: null,
  touring: false,
  showcaseSlug: null,
  mounted: ["hub"],

  goTo: (index) => {
    const { stops, stopIndex, targetIndex } = get();
    if (index === stopIndex && targetIndex === null) return;
    const stop = stops[index];
    if (!stop) return;
    set((s) => ({
      targetIndex: index,
      showcaseSlug: null,
      mounted: s.mounted.includes(stop.realm)
        ? s.mounted
        : [...s.mounted, stop.realm],
    }));
  },

  arrive: () => {
    const { targetIndex, stops } = get();
    if (targetIndex === null) return;
    const stop = stops[targetIndex];
    audio.chime();
    set({
      stopIndex: targetIndex,
      targetIndex: null,
      showcaseSlug: stop.showcase ?? null,
      // one-realm-at-a-time rule
      mounted: [stop.realm],
    });
  },

  next: () => {
    const { stops, targetIndex, stopIndex, goTo } = get();
    const cur = targetIndex ?? stopIndex;
    goTo(Math.min(cur + 1, stops.length - 1));
  },

  prev: () => {
    const { targetIndex, stopIndex, goTo } = get();
    const cur = targetIndex ?? stopIndex;
    goTo(Math.max(cur - 1, 0));
  },

  startTour: () => {
    const { stopIndex, stops } = get();
    set({ touring: true });
    // at the end → restart from the top; otherwise hold here first —
    // TourDriver advances after the stop's holdMs
    if (stopIndex >= stops.length - 1 && stops.length > 1) get().goTo(0);
  },

  pauseTour: () => set({ touring: false }),

  goToRealm: (realm) => {
    const { stops } = get();
    const idx = stops.findIndex((s) => s.realm === realm);
    if (idx >= 0) {
      set({ touring: false });
      get().goTo(idx);
    }
  },

  dismissShowcase: () => set({ showcaseSlug: null }),
}));
