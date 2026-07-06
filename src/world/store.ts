import { create } from "zustand";

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
  /** Kip's line, in Priyadeep's voice */
  line: string;
  /** project slug → showcase card in HUD */
  showcase?: string;
  /** auto-tour hold after the line finishes typing (ms) */
  holdMs?: number;
}

interface WorldState {
  // — layer —
  worldActive: boolean;
  setWorldActive: (on: boolean) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;

  // — tour —
  stops: TourStop[];
  setStops: (stops: TourStop[]) => void;
  stopIndex: number;
  targetIndex: number | null; // non-null while flying
  touring: boolean;
  dialogue: { text: string; key: string } | null;
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
  /** transient Kip line (reactions, easter eggs) */
  say: (text: string) => void;
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

  stops: [],
  setStops: (stops) =>
    set((s) => ({
      stops,
      // show the first stop's line on boot
      dialogue:
        s.dialogue ?? (stops[0] ? { text: stops[0].line, key: stops[0].id } : null),
    })),
  stopIndex: 0,
  targetIndex: null,
  touring: false,
  dialogue: null,
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
      dialogue: null,
      // mount destination realm alongside current for the flight
      mounted: s.mounted.includes(stop.realm)
        ? s.mounted
        : [...s.mounted, stop.realm],
    }));
  },

  arrive: () => {
    const { targetIndex, stops } = get();
    if (targetIndex === null) return;
    const stop = stops[targetIndex];
    set({
      stopIndex: targetIndex,
      targetIndex: null,
      dialogue: { text: stop.line, key: stop.id },
      showcaseSlug: stop.showcase ?? null,
      // keep only the realm we're in (one-realm-at-a-time rule)
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
    // if at the end, restart from the top
    if (stopIndex >= stops.length - 1) get().goTo(0);
    else get().next();
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

  say: (text) => set({ dialogue: { text, key: `say-${text.slice(0, 18)}` } }),
}));
