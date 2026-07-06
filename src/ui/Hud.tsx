"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Resume } from "@/content/types";
import { audio } from "@/lib/audio";
import { useWorld, type RealmId } from "@/world/store";
import { REALMS } from "@/world/layout";
import { BUILT_REALMS } from "@/world/registry";

/**
 * The HUD — wordmark, realm compass, mute, a minimal tour dock,
 * and the project showcase card. No narrator: light + sound carry it.
 */
export function Hud({ resume }: { resume: Resume }) {
  const phase = useWorld((s) => s.phase);
  if (phase === "menu") return null;
  return (
    <div className="hud">
      <Wordmark name={resume.basics.name} label={resume.basics.label} />
      <RealmNav />
      <ShowcaseCard resume={resume} />
      <TourDock />
    </div>
  );
}

function Wordmark({ name, label }: { name: string; label: string }) {
  return (
    <div className="hud-wordmark">
      <span className="hud-title">KALPANA</span>
      <span className="hud-subtitle">
        {name} · {label.split("·")[0].trim()}
      </span>
    </div>
  );
}

function RealmNav() {
  const goToRealm = useWorld((s) => s.goToRealm);
  const setWorldActive = useWorld((s) => s.setWorldActive);
  const muted = useWorld((s) => s.muted);
  const toggleMuted = useWorld((s) => s.toggleMuted);
  const stops = useWorld((s) => s.stops);
  const stopIndex = useWorld((s) => s.stopIndex);
  const currentRealm = stops[stopIndex]?.realm ?? "hub";

  const realms: RealmId[] = ["hub", "projects", "experience", "achievements", "about"];

  return (
    <nav className="hud-nav" aria-label="Realms">
      {realms.map((r) => {
        const built = (BUILT_REALMS as readonly string[]).includes(r);
        return (
          <button
            key={r}
            className={`hud-pill ${currentRealm === r ? "is-active" : ""} ${built ? "" : "is-soon"}`}
            disabled={!built}
            onClick={() => {
              audio.click();
              goToRealm(r);
            }}
          >
            {REALMS[r].label}
            {!built && <span className="hud-soon">soon</span>}
          </button>
        );
      })}
      <button
        className="hud-pill hud-pill-icon"
        onClick={toggleMuted}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <button
        className="hud-pill hud-pill-text"
        onClick={() => setWorldActive(false)}
        title="Read everything as plain text"
      >
        📄 Text
      </button>
    </nav>
  );
}

function TourDock() {
  const touring = useWorld((s) => s.touring);
  const targetIndex = useWorld((s) => s.targetIndex);
  const stopIndex = useWorld((s) => s.stopIndex);
  const stops = useWorld((s) => s.stops);
  const { next, prev, startTour, pauseTour } = useWorld.getState();
  const flying = targetIndex !== null;

  return (
    <div className="hud-dock">
      <button
        className="hud-ctl"
        onClick={() => {
          audio.click();
          prev();
        }}
        disabled={stopIndex === 0 && !flying}
        aria-label="Previous stop"
      >
        ◀
      </button>
      <button
        className="hud-ctl hud-ctl-main"
        onClick={() => {
          audio.click();
          if (touring) pauseTour();
          else startTour();
        }}
        aria-label={touring ? "Pause tour" : "Resume tour"}
      >
        {touring ? "❚❚" : "▶ tour"}
      </button>
      <button
        className="hud-ctl"
        onClick={() => {
          audio.click();
          next();
        }}
        disabled={stopIndex >= stops.length - 1 && !flying}
        aria-label="Next stop"
      >
        ▶
      </button>
      <span className="hud-dock-count">
        {Math.min((targetIndex ?? stopIndex) + 1, stops.length)} / {stops.length}
      </span>
    </div>
  );
}

function ShowcaseCard({ resume }: { resume: Resume }) {
  const slug = useWorld((s) => s.showcaseSlug);
  const dismiss = useWorld((s) => s.dismissShowcase);
  const [visible, setVisible] = useState(false);
  const lastSlug = useRef<string | null>(null);
  if (slug) lastSlug.current = slug;

  useEffect(() => {
    setVisible(!!slug);
  }, [slug]);

  const project = useMemo(
    () => resume.projects.find((p) => p.slug === lastSlug.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, resume]
  );

  if (!project) return null;

  return (
    <aside className={`hud-card ${visible ? "is-open" : ""}`} aria-hidden={!visible}>
      <button className="hud-card-close" onClick={dismiss} aria-label="Close showcase">
        ✕
      </button>
      <p className="hud-card-kicker">✦ project showcase</p>
      <h2 className="hud-card-title">{project.name}</h2>
      <p className="hud-card-tags">{project.keywords.join(" · ")}</p>
      <p className="hud-card-summary">{project.summary}</p>
      <ul className="hud-card-list">
        {project.highlights.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
      {project.links && (
        <div className="hud-card-links">
          {project.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
