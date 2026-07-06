"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Resume } from "@/content/types";
import { useWorld, type RealmId } from "@/world/store";
import { REALMS } from "@/world/layout";
import { BUILT_REALMS } from "@/world/stops";

/**
 * The HUD — Kalpana's UI bar. Wordmark, realm compass, Kip's dialogue
 * bar with tour controls, and the project showcase card.
 */
export function Hud({ resume }: { resume: Resume }) {
  return (
    <div className="hud">
      <Wordmark name={resume.basics.name} label={resume.basics.label} />
      <RealmNav />
      <ShowcaseCard resume={resume} />
      <KipBar />
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
  const say = useWorld((s) => s.say);
  const setWorldActive = useWorld((s) => s.setWorldActive);
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
            onClick={() =>
              built
                ? goToRealm(r)
                : say(`${REALMS[r].label} is still growing — new islands sprout here soon! ✦`)
            }
          >
            {REALMS[r].label}
            {!built && <span className="hud-soon">soon</span>}
          </button>
        );
      })}
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

function KipBar() {
  const dialogue = useWorld((s) => s.dialogue);
  const touring = useWorld((s) => s.touring);
  const targetIndex = useWorld((s) => s.targetIndex);
  const stopIndex = useWorld((s) => s.stopIndex);
  const stops = useWorld((s) => s.stops);
  const { next, prev, startTour, pauseTour } = useWorld.getState();

  const typed = useTypewriter(dialogue?.text ?? "", dialogue?.key ?? "");
  const flying = targetIndex !== null;

  // auto-tour: advance after the line finishes + hold
  useEffect(() => {
    if (!touring || flying || !dialogue) return;
    const stop = stops[stopIndex];
    const typeMs = dialogue.text.length * 26;
    const holdMs = stop?.holdMs ?? 2400;
    const t = setTimeout(() => {
      const st = useWorld.getState();
      if (st.stopIndex >= st.stops.length - 1) st.pauseTour();
      else st.next();
    }, typeMs + holdMs);
    return () => clearTimeout(t);
  }, [touring, flying, dialogue, stopIndex, stops]);

  return (
    <div className="hud-kipbar">
      <div className="hud-kip-avatar" aria-hidden>
        <div className="hud-kip-glow" />
      </div>
      <p className="hud-dialogue" aria-live="polite">
        {flying ? <span className="hud-flying">✦ · · ·</span> : typed}
      </p>
      <div className="hud-controls">
        <button
          className="hud-ctl"
          onClick={prev}
          disabled={stopIndex === 0 && !flying}
          aria-label="Previous stop"
        >
          ◀
        </button>
        <button
          className="hud-ctl hud-ctl-main"
          onClick={touring ? pauseTour : startTour}
          aria-label={touring ? "Pause tour" : "Take the tour"}
        >
          {touring ? "❚❚" : "take the tour ↓"}
        </button>
        <button
          className="hud-ctl"
          onClick={next}
          disabled={stopIndex >= stops.length - 1 && !flying}
          aria-label="Next stop"
        >
          ▶
        </button>
      </div>
    </div>
  );
}

function ShowcaseCard({ resume }: { resume: Resume }) {
  const slug = useWorld((s) => s.showcaseSlug);
  const dismiss = useWorld((s) => s.dismissShowcase);
  // keep last project while sliding out
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

function useTypewriter(text: string, key: string, speed = 24): string {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    if (!text) return;
    const iv = setInterval(() => {
      setN((cur) => {
        if (cur >= text.length) {
          clearInterval(iv);
          return cur;
        }
        return cur + 1;
      });
    }, speed);
    return () => clearInterval(iv);
  }, [text, key, speed]);

  return text.slice(0, n);
}
