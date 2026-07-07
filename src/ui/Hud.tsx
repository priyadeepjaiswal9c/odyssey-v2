"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Content } from "@/content/types";
import { audio } from "@/lib/audio";
import { useWorld, type RealmId } from "@/world/store";
import { REALM_LABELS, BUILT_REALMS } from "@/world/registry";

/**
 * In-world HUD: realm compass, tour dock, showcase cards, toggles.
 * (The recruiter FastLane bar is separate and persists over the menu too.)
 */
export function Hud({ content }: { content: Content }) {
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
      <RealmNav />
      <ShowcaseCard content={content} />
      <TourDock />
    </div>
  );
}

/**
 * The recruiter fast lane — persistent on the menu AND in every realm.
 * Résumé (PDF) · realms · GitHub · LinkedIn · Contact · Classic view.
 */
export function FastLane({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);
  const goToRealm = useWorld((s) => s.goToRealm);
  const enterWorld = useWorld((s) => s.enterWorld);
  const github = content.basics.profiles.find((p) => p.network === "GitHub");
  const linkedin = content.basics.profiles.find(
    (p) => p.network === "LinkedIn"
  );

  const jump = (realm: RealmId) => {
    audio.click();
    if (phase === "menu") enterWorld(realm);
    else goToRealm(realm);
  };

  return (
    <nav className="fastlane" aria-label="Quick links">
      <span className="fastlane-name">{content.basics.name.toUpperCase()}</span>
      <div className="fastlane-links">
        <a className="fastlane-cta" href="/resume.pdf" download>
          ⬇ Résumé
        </a>
        <button onClick={() => jump("projects")}>Projects</button>
        <button onClick={() => jump("experience")}>Experience</button>
        <button onClick={() => jump("achievements")}>Achievements</button>
        {github && (
          <a href={github.url} target="_blank" rel="noopener">
            GitHub
          </a>
        )}
        {linkedin && (
          <a href={linkedin.url} target="_blank" rel="noopener">
            LinkedIn
          </a>
        )}
        <a href={`mailto:${content.basics.email}`}>Contact</a>
        <a href="/classic" className="fastlane-classic">
          Classic view
        </a>
      </div>
    </nav>
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
            {REALM_LABELS[r]}
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
  /** project slug → screenshot slot */
  screenshot?: string;
}

/** builds card content for a stop's showcase slug — project or #special */
function buildCard(slug: string, content: Content): CardData | null {
  switch (slug) {
    case "#work": {
      const w = content.work[0];
      if (!w) return null;
      return {
        kicker: "✦ experience",
        title: `${w.position} · ${w.name}`,
        tags: `${w.dates}${w.location ? ` · ${w.location}` : ""}`,
        items: w.highlights,
      };
    }
    case "#education":
      return {
        kicker: "✦ education",
        title: "Education",
        items: content.education.map(
          (e) =>
            `${e.institution} — ${e.degree} (${e.dates}${e.score ? `, ${e.score}` : ""})`
        ),
      };
    case "#volunteer":
      return {
        kicker: "✦ beyond the classroom",
        title: "Extra Curricular",
        items: content.volunteer.map((v) => `${v.role} — ${v.summary}`),
      };
    case "#awards":
      return {
        kicker: "✦ the monument hall",
        title: "Achievements",
        items: content.awards.map((a) => `${a.title} — ${a.summary}`),
      };
    case "#contact": {
      const links = [
        { label: "Email", url: `mailto:${content.basics.email}` },
        ...content.basics.profiles.map((p) => ({
          label: p.network,
          url: p.url,
        })),
        { label: "Résumé PDF", url: "/resume.pdf" },
      ];
      return {
        kicker: "✦ say hi",
        title: content.basics.name,
        tags: content.basics.location,
        summary: content.basics.summary,
        items: [],
        links,
      };
    }
    default: {
      const project = content.projects.find((p) => p.slug === slug);
      if (!project) return null;
      return {
        kicker: "✦ project showcase",
        title: project.name,
        tags: project.stack,
        summary: project.oneLiner,
        items: project.highlights,
        links: project.links,
        screenshot: project.screenshot,
      };
    }
  }
}

function ShowcaseCard({ content }: { content: Content }) {
  const slug = useWorld((s) => s.showcaseSlug);
  const dismiss = useWorld((s) => s.dismissShowcase);
  const [visible, setVisible] = useState(false);
  const lastSlug = useRef<string | null>(null);
  if (slug) lastSlug.current = slug;

  useEffect(() => {
    setVisible(!!slug);
  }, [slug]);

  const card = useMemo(
    () => (lastSlug.current ? buildCard(lastSlug.current, content) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, content]
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
      {card.screenshot && <Screenshot src={card.screenshot} title={card.title} />}
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

/** real screenshot if present, stylized placeholder if not (never stalls) */
function Screenshot({ src, title }: { src: string; title: string }) {
  const [missing, setMissing] = useState(false);
  if (missing)
    return (
      <div className="hud-shot hud-shot-placeholder" aria-hidden>
        <span>▦</span>
        <small>{title.split("–")[0].split("—")[0].trim()}</small>
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="hud-shot"
      src={src}
      alt={`${title} screenshot`}
      onError={() => setMissing(true)}
    />
  );
}
