"use client";

import { useCallback } from "react";
import { audio } from "@/lib/audio";
import { useWorld, type RealmId } from "@/world/store";
import { BUILT_REALMS } from "@/world/registry";

/**
 * Minecraft-style start menu: blocky KALPANA logo over the live world,
 * stone-textured beveled buttons with hover + click-depress.
 * The first click here is the audio-unlock gesture.
 */

const ENTRIES: { label: string; dest: "tour" | RealmId; sub?: string }[] = [
  { label: "Explore World", dest: "tour", sub: "guided tour" },
  { label: "Projects", dest: "projects" },
  { label: "Experience", dest: "experience" },
  { label: "Achievements", dest: "achievements" },
  { label: "About", dest: "about" },
];

export function StartMenu() {
  const phase = useWorld((s) => s.phase);
  const enterWorld = useWorld((s) => s.enterWorld);
  const setWorldActive = useWorld((s) => s.setWorldActive);

  const hoverSfx = useCallback(() => {
    if (audio.unlocked) audio.hover();
  }, []);

  if (phase !== "menu") return null;

  return (
    <div className="menu" role="dialog" aria-label="Kalpana start menu">
      <div className="menu-scrim" />
      <div className="menu-panel">
        <h1 className="menu-logo" aria-label="Kalpana">
          {"KALPANA".split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.09}s` }}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="menu-tagline">Priyadeep Jaiswal — a voxel portfolio world</p>

        <div className="menu-buttons">
          {ENTRIES.map((e) => {
            const built =
              e.dest === "tour" ||
              (BUILT_REALMS as readonly string[]).includes(e.dest);
            return (
              <button
                key={e.label}
                className="mc-btn"
                disabled={!built}
                onMouseEnter={hoverSfx}
                onClick={() => built && enterWorld(e.dest)}
              >
                {e.label}
                {e.sub && built && <small>{e.sub}</small>}
                {!built && <small>soon</small>}
              </button>
            );
          })}
        </div>

        <button
          className="menu-text-link"
          onClick={() => setWorldActive(false)}
        >
          📄 read as plain text instead
        </button>
      </div>
    </div>
  );
}
