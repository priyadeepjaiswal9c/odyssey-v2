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

  // keyboard: ← → step stops, space toggles the tour, Esc closes the card
  useEffect(() => {
    if (phase === "menu") return;
    const onKey = (e: KeyboardEvent) => {
      const st = useWorld.getState();
      if (e.key === "ArrowRight") {
        audio.click();
        st.next();
      } else if (e.key === "ArrowLeft") {
        audio.click();
        st.prev();
      } else if (e.key === " " && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        audio.click();
        if (st.touring) st.pauseTour();
        else st.startTour();
      } else if (e.key === "Escape") {
        st.dismissShowcase();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

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
  const night = useWorld((s) => s.night);
  const toggleNight = useWorld((s) => s.toggleNight);
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
            onMouseEnter={() => audio.hover()}
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
        onClick={toggleNight}
        aria-label={night ? "Switch to golden hour" : "Switch to night"}
        title={night ? "Golden hour" : "Night"}
      >
        {night ? "☀️" : "🌙"}
      </button>
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
        onMouseEnter={() => audio.hover()}
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

interface CardData {
  kicker: string;
  title: string;
  tags?: string;
  summary?: string;
  items: string[];
  links?: { label: string; url: string }[];
}

/** builds card content for a stop's showcase slug — project or #special */
function buildCard(slug: string, resume: Resume): CardData | null {
  switch (slug) {
    case "#work": {
      const w = resume.work[0];
      if (!w) return null;
      return {
        kicker: "✦ experience",
        title: `${w.position} · ${w.name}`,
        tags: `${fmtRange(w.startDate, w.endDate)}${w.location ? ` · ${w.location}` : ""}`,
        summary: w.summary,
        items: w.highlights,
      };
    }
    case "#education":
      return {
        kicker: "✦ education",
        title: "Education",
        items: resume.education.map(
          (e) =>
            `${e.institution} — ${e.studyType} in ${e.area} (${fmtRange(e.startDate, e.endDate)}${e.score ? `, ${e.score}` : ""})`
        ),
      };
    case "#volunteer":
      return {
        kicker: "✦ beyond the classroom",
        title: "Extra Curricular",
        items: resume.volunteer.map(
          (v) => `${v.position}, ${v.organization} — ${v.summary}`
        ),
      };
    case "#awards":
      return {
        kicker: "✦ the trophy hall",
        title: "Achievements",
        items: resume.awards.map((a) => `${a.title} — ${a.summary}`),
      };
    case "#contact": {
      const links = [
        { label: "Email", url: `mailto:${resume.basics.email}` },
        ...resume.basics.profiles.map((p) => ({
          label: p.network,
          url: p.url,
        })),
      ];
      return {
        kicker: "✦ say hi",
        title: resume.basics.name,
        tags: `${resume.basics.location.city}, ${resume.basics.location.region}`,
        summary: resume.basics.summary,
        items: [],
        links,
      };
    }
    default: {
      const project = resume.projects.find((p) => p.slug === slug);
      if (!project) return null;
      return {
        kicker: "✦ project showcase",
        title: project.name,
        tags: project.keywords.join(" · "),
        summary: project.summary,
        items: project.highlights,
        links: project.links,
      };
    }
  }
}

function fmtRange(start: string, end?: string) {
  const f = (iso: string) => {
    const [y, mo] = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return mo ? `${months[parseInt(mo, 10) - 1]} ${y}` : y;
  };
  return `${f(start)} – ${end ? f(end) : "Present"}`;
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

  const card = useMemo(
    () => (lastSlug.current ? buildCard(lastSlug.current, resume) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, resume]
  );

  if (!card) return null;

  return (
    <aside className={`hud-card ${visible ? "is-open" : ""}`} aria-hidden={!visible}>
      <button className="hud-card-close" onClick={dismiss} aria-label="Close showcase">
        ✕
      </button>
      <p className="hud-card-kicker">{card.kicker}</p>
      <h2 className="hud-card-title">{card.title}</h2>
      {card.tags && <p className="hud-card-tags">{card.tags}</p>}
      {card.summary && <p className="hud-card-summary">{card.summary}</p>}
      {card.items.length > 0 && (
        <ul className="hud-card-list">
          {card.items.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      {card.links && (
        <div className="hud-card-links">
          {card.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
