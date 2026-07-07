"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Content } from "@/content/types";
import { useWorld, type Quality } from "./store";
import { StartMenu } from "@/ui/StartMenu";
import { EntryGate } from "@/ui/EntryGate";
import { FastLane } from "@/ui/Hud";

// client-only: the canvas + anything touching window
const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => null, // the EntryGate IS the loading screen
});

/**
 * Decides whether the voxel world runs, and layers it over the text core.
 *  - reduced-motion / no-WebGL → Classic-style text core (opt-in button)
 *  - otherwise: EntryGate (summary) → Minecraft menu → world
 * The recruiter FastLane persists over every phase.
 */
export function WorldGate({ content }: { content: Content }) {
  const { worldActive, setWorldActive, setQuality } = useWorld();
  const [capable, setCapable] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const probe = detectCapability();
    setCapable(probe.webgl);
    if (probe.webgl) setQuality(probe.tier);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
    if (probe.webgl && !rm) setWorldActive(true);
  }, [setQuality, setWorldActive]);

  if (capable === null) return null; // first paint: text core is already there
  if (!capable) return null; // text core is the experience — and it's a good one

  if (!worldActive) {
    return (
      <button className="enter-world-btn" onClick={() => setWorldActive(true)}>
        ✦ Enter the world
        {reducedMotion ? <small> (motion-heavy)</small> : null}
      </button>
    );
  }

  return (
    <div
      className="world-layer"
      role="application"
      aria-label="Voxel portfolio world"
    >
      <World content={content} />
      <StartMenu content={content} />
      <EntryGate content={content} />
      <FastLane content={content} />
      <ContextLostOverlay />
    </div>
  );
}

/** WebGL context died — offer a reload, point at the classic view */
function ContextLostOverlay() {
  const lost = useWorld((s) => s.contextLost);
  if (!lost) return null;
  return (
    <div className="ctx-lost" role="alert">
      <p>The 3D view hit a graphics hiccup.</p>
      <div>
        <button className="mc-btn" onClick={() => window.location.reload()}>
          Reload world
        </button>
        <a className="mc-btn" href="/classic">
          View résumé instead
        </a>
      </div>
    </div>
  );
}

function detectCapability(): { webgl: boolean; tier: Quality } {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return { webgl: false, tier: "low" };
    const cores = navigator.hardwareConcurrency ?? 4;
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const tier: Quality =
      !mobile && cores >= 8 ? "high" : cores >= 4 ? "medium" : "low";
    return { webgl: true, tier };
  } catch {
    return { webgl: false, tier: "low" };
  }
}
