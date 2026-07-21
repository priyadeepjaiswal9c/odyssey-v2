"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Download,
  Mail,
  MousePointer2,
} from "lucide-react";
import type { Content } from "@/content/types";
import { audio } from "@/lib/audio";
import { useWorld, type RealmId } from "@/world/store";
import { REALM_LABELS, BUILT_REALMS } from "@/world/registry";

/** In-world HUD: the showcase card, edge nav, and the scroll hint. */
export function Hud({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);

  // keyboard: arrows / space step through stops; Esc closes the card
  useEffect(() => {
    if (phase !== "world") return;
    const onKey = (e: KeyboardEvent) => {
      const st = useWorld.getState();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        audio.click();
        st.next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        audio.click();
        st.prev();
      } else if (e.key === "Escape") {
        st.dismissShowcase();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase !== "world") return null;
  return (
    <div className="hud">
      <ShowcaseCard content={content} />
      <EdgeNav />
      <ScrollHint />
    </div>
  );
}

/**
 * The single top bar — brand, realm nav, day/night + sound, and the
 * recruiter links. Persists across the entry and the world (no second bar).
 */
export function TopBar({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);
  const goToRealm = useWorld((s) => s.goToRealm);
  const enterWorld = useWorld((s) => s.enterWorld);
  const setWorldActive = useWorld((s) => s.setWorldActive);
  const muted = useWorld((s) => s.muted);
  const toggleMuted = useWorld((s) => s.toggleMuted);
  const night = useWorld((s) => s.night);
  const toggleNight = useWorld((s) => s.toggleNight);
  const stops = useWorld((s) => s.stops);
  const stopIndex = useWorld((s) => s.stopIndex);
  const currentRealm = stops[stopIndex]?.realm ?? "hub";

  const github = content.basics.profiles.find((p) => p.network === "GitHub");
  const linkedin = content.basics.profiles.find((p) => p.network === "LinkedIn");
  const realms: RealmId[] = ["hub", "projects", "experience", "achievements", "about"];
  const inWorld = phase !== "gate";

  const jump = (r: RealmId) => {
    audio.click();
    if (phase === "gate") enterWorld(r);
    else goToRealm(r);
  };

  return (
    <header className="topbar">
      <span className="topbar-brand">{content.basics.name}</span>

      {inWorld && (
        <nav className="topbar-realms" aria-label="Sections">
          {realms.map((r) => {
            const built = (BUILT_REALMS as readonly string[]).includes(r);
            return (
              <button
                key={r}
                className={`topbar-realm ${currentRealm === r ? "is-active" : ""}`}
                disabled={!built}
                onMouseEnter={() => audio.hover()}
                onClick={() => jump(r)}
              >
                {REALM_LABELS[r]}
              </button>
            );
          })}
        </nav>
      )}

      <div className="topbar-right">
        {inWorld && (
          <>
            <button
              className="topbar-icon"
              onClick={toggleNight}
              title={night ? "Golden hour" : "Night"}
              aria-label={night ? "Switch to golden hour" : "Switch to night"}
            >
              {night ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="topbar-icon"
              onClick={toggleMuted}
              title={muted ? "Unmute" : "Mute"}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <span className="topbar-sep" />
          </>
        )}
        {github && (
          <a className="topbar-ghost" href={github.url} target="_blank" rel="noopener">
            GitHub
          </a>
        )}
        {linkedin && (
          <a className="topbar-ghost" href={linkedin.url} target="_blank" rel="noopener">
            LinkedIn
          </a>
        )}
        <a className="topbar-icon" href={`mailto:${content.basics.email}`} title="Email">
          <Mail size={17} />
        </a>
        <a className="topbar-link" href="/classic" onClick={() => phase !== "gate" && setWorldActive(false)}>
          <FileText size={15} /> Classic view
        </a>
        <a className="topbar-cta" href="/resume.pdf" download>
          <Download size={15} /> PDF
        </a>
      </div>
    </header>
  );
}

/** scroll-to-move hint — fades once the visitor starts scrolling */
function ScrollHint() {
  const stopIndex = useWorld((s) => s.stopIndex);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (stopIndex > 0) setGone(true);
  }, [stopIndex]);
  if (gone) return null;
  return (
    <div className="scroll-hint" aria-hidden>
      <MousePointer2 size={16} />
      <span>scroll to explore</span>
      <ChevronRight size={16} className="scroll-hint-arrow" />
    </div>
  );
}

/** edge chevrons + scroll-wheel stepping (no auto-tour) */
function EdgeNav() {
  const stopIndex = useWorld((s) => s.stopIndex);
  const targetIndex = useWorld((s) => s.targetIndex);
  const stops = useWorld((s) => s.stops);
  const { next, prev } = useWorld.getState();
  const flying = targetIndex !== null;
  const wheelLock = useRef(0);

  // scrolling anywhere (except over the card) steps through the stops
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement | null)?.closest(".hud-card")) return;
      const now = performance.now();
      if (now - wheelLock.current < 750 || Math.abs(e.deltaY) < 10) return;
      wheelLock.current = now;
      const st = useWorld.getState();
      if (e.deltaY > 0) st.next();
      else st.prev();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <>
      <button
        className="edge-nav edge-nav-left"
        onClick={() => {
          audio.click();
          prev();
        }}
        disabled={stopIndex === 0 && !flying}
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="edge-nav edge-nav-right"
        onClick={() => {
          audio.click();
          next();
        }}
        disabled={stopIndex >= stops.length - 1 && !flying}
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>
      <div className="stop-progress">
        {Math.min((targetIndex ?? stopIndex) + 1, stops.length)} / {stops.length}
      </div>
    </>
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

function buildCard(slug: string, content: Content): CardData | null {
  switch (slug) {
    case "#work": {
      const w = content.work[0];
      if (!w) return null;
      return {
        kicker: "experience",
        title: `${w.position} · ${w.name}`,
        tags: `${w.dates}${w.location ? ` · ${w.location}` : ""}`,
        items: w.highlights,
      };
    }
    case "#education":
      return {
        kicker: "education",
        title: "Education",
        items: content.education.map(
          (e) => `${e.institution} — ${e.degree} (${e.dates}${e.score ? `, ${e.score}` : ""})`
        ),
      };
    case "#volunteer":
      return {
        kicker: "beyond the classroom",
        title: "Extra-curricular",
        items: content.volunteer.map((v) => `${v.role} — ${v.summary}`),
      };
    case "#awards":
      return {
        kicker: "achievements",
        title: "Achievements",
        items: content.awards.map((a) => `${a.title} — ${a.summary}`),
      };
    case "#contact": {
      const links = [
        { label: "Email", url: `mailto:${content.basics.email}` },
        ...content.basics.profiles.map((p) => ({ label: p.network, url: p.url })),
        { label: "Résumé PDF", url: "/resume.pdf" },
      ];
      return {
        kicker: "say hi",
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
        kicker: "project",
        title: project.name,
        tags: project.stack,
        summary: project.oneLiner,
        items: project.highlights,
        links: project.links,
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
      <button className="hud-card-close" onClick={dismiss} aria-label="Close">
        <X size={18} />
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
              {l.label} <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
