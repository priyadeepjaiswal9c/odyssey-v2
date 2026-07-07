"use client";

import { useCallback } from "react";
import type { Content } from "@/content/types";
import { audio } from "@/lib/audio";
import { useWorld, type RealmId } from "@/world/store";
import { BUILT_REALMS } from "@/world/registry";

/**
 * Minecraft-style main menu over the live golden-hour vista.
 * Title = the owner's name (never the codename). Stone beveled buttons.
 */

const ENTRIES: { label: string; dest: "tour" | RealmId; sub?: string }[] = [
  { label: "Explore World", dest: "tour", sub: "guided tour" },
  { label: "Projects", dest: "projects" },
  { label: "Experience", dest: "experience" },
  { label: "Achievements", dest: "achievements" },
  { label: "About", dest: "about" },
];

export function StartMenu({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);
  const enterWorld = useWorld((s) => s.enterWorld);

  const hoverSfx = useCallback(() => {
    if (audio.unlocked) audio.hover();
  }, []);

  if (phase !== "menu") return null;

  const [first, ...rest] = content.basics.name.toUpperCase().split(" ");

  return (
    <div className="menu" role="dialog" aria-label="Main menu">
      <div className="menu-scrim" />
      <div className="menu-panel">
        <h1 className="menu-logo" aria-label={content.basics.name}>
          <span className="menu-logo-line">
            {first.split("").map((ch, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </span>
          <span className="menu-logo-line">
            {rest
              .join(" ")
              .split("")
              .map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.4 + i * 0.06}s` }}>
                  {ch === " " ? " " : ch}
                </span>
              ))}
          </span>
        </h1>
        <p className="menu-tagline">{content.basics.tagline}</p>

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

        <div className="menu-footlinks">
          <a href="/resume.pdf" download>
            ⬇ Résumé (PDF)
          </a>
          <a href="/classic">In a hurry? View résumé →</a>
        </div>
      </div>
    </div>
  );
}
