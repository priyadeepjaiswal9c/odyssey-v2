"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Resume } from "@/content/types";
import { useWorld, type Quality } from "./store";

const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => <Loader />,
});

/**
 * Decides whether the voxel world runs, and layers it over the text core.
 *  - reduced-motion users stay on the text core (opt-in button to enter anyway)
 *  - no WebGL → text core only
 *  - otherwise the world auto-enters (it's the showpiece), text always a click away
 */
export function WorldGate({ resume }: { resume: Resume }) {
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
    <div className="world-layer" role="application" aria-label="Kalpana voxel world">
      <World resume={resume} />
    </div>
  );
}

function Loader() {
  return (
    <div className="world-loader" aria-hidden>
      <div className="world-loader-glow" />
      <p className="world-loader-title">Kalpana</p>
      <p className="world-loader-sub">waking Kip…</p>
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
    // crude but effective tiering: DPR + cores + mobile UA
    const cores = navigator.hardwareConcurrency ?? 4;
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const tier: Quality =
      !mobile && cores >= 8 ? "high" : cores >= 4 ? "medium" : "low";
    return { webgl: true, tier };
  } catch {
    return { webgl: false, tier: "low" };
  }
}
