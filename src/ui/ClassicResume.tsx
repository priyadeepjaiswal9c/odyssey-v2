"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Download,
  Mail,
  ArrowUpRight,
  ArrowLeft,
  MapPin,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import type { Content } from "@/content/types";

const NAV = [
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

/** fades + lifts a block into view as it scrolls in (progressive enhancement) */
function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      // @ts-expect-error — polymorphic ref across div/li/section is safe here
      ref={ref}
      className={`cl-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="cl-section">
      <Reveal className="cl-section-head">
        <p className="cl-kicker">
          <span className="cl-kicker-dot" />
          {kicker}
        </p>
        <h2 className="cl-h2">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}

export function ClassicResume({ content }: { content: Content }) {
  const { basics, work, education, projects, awards, skills, volunteer } = content;
  const github = basics.profiles.find((p) => p.network === "GitHub");
  const linkedin = basics.profiles.find((p) => p.network === "LinkedIn");

  // — theme (dark-first, to match the world; remembered per visitor) —
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cl-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* private mode — stay on default */
    }
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("cl-theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // — reading-progress bar —
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // — scroll-spy: which section the nav should light up —
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cl-root" data-theme={theme}>
      <div
        className="cl-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      {/* slow warm aurora drifting behind everything */}
      <div className="cl-aurora" aria-hidden>
        <span className="cl-aurora-a" />
        <span className="cl-aurora-b" />
        <span className="cl-aurora-c" />
      </div>

      <header className="cl-topbar">
        <a className="cl-brand" href="/">
          {basics.name}
        </a>
        <nav className="cl-nav">
          {NAV.map((n) => (
            <a
              key={n.id}
              className={`cl-nav-link ${active === n.id ? "is-active" : ""}`}
              href={`#${n.id}`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="cl-nav-actions">
          <button
            className="cl-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
            title={theme === "dark" ? "Light" : "Dark"}
          >
            <span className="cl-theme-icon">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </span>
          </button>
          <a className="cl-nav-back" href="/">
            <ArrowLeft size={14} /> World
          </a>
          <a className="cl-nav-cta" href="/resume.pdf" download>
            <Download size={14} /> PDF
          </a>
        </div>
      </header>

      <div className="cl-page">
        {/* hero */}
        <header className="cl-hero">
          <Reveal>
            <p className="cl-kicker">
              <span className="cl-kicker-dot" />
              {basics.tagline}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="cl-name">{basics.name}</h1>
          </Reveal>
          <Reveal delay={170}>
            <p className="cl-what">{basics.whatIDo}</p>
          </Reveal>
          <Reveal delay={240}>
            <p className="cl-summary">{basics.summary}</p>
            <p className="cl-meta">
              <MapPin size={14} /> {basics.location}
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="cl-hero-actions">
              <a className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}>
                <Mail size={15} /> Email
              </a>
              {github && (
                <a className="cl-btn" href={github.url} target="_blank" rel="noopener">
                  GitHub <ArrowUpRight size={13} />
                </a>
              )}
              {linkedin && (
                <a className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">
                  LinkedIn <ArrowUpRight size={13} />
                </a>
              )}
              <a className="cl-btn" href="/resume.pdf" download>
                <Download size={14} /> PDF
              </a>
            </div>
          </Reveal>
        </header>

        {skills.length > 0 && (
          <Section id="skills" kicker="01 — Toolkit" title="Skills">
            <div className="cl-skillgroups">
              {skills.map((g, i) => (
                <Reveal key={g.name} className="cl-skillgroup" delay={i * 70}>
                  <h3 className="cl-skillgroup-name">{g.name}</h3>
                  <div className="cl-chips">
                    {g.keywords.map((k) => (
                      <span key={k} className="cl-chip">
                        {k}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {work.length > 0 && (
          <Section id="experience" kicker="02 — Career" title="Experience">
            {work.map((w, i) => (
              <Reveal key={w.name + w.position} className="cl-entry" delay={i * 55}>
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">
                    {w.position} · <span className="cl-accent">{w.name}</span>
                  </h3>
                  <span className="cl-entry-meta">
                    {w.dates}
                    {w.location ? ` · ${w.location}` : ""}
                  </span>
                </div>
                <ul className="cl-list">
                  {w.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" kicker="03 — Selected builds" title="Projects">
            {projects.map((p, i) => (
              <Reveal key={p.slug} className="cl-entry" delay={i * 55}>
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{p.name}</h3>
                  <span className="cl-entry-meta">{p.stack}</span>
                </div>
                <p className="cl-entry-lead">{p.oneLiner}</p>
                <ul className="cl-list">
                  {p.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
                {p.links.length > 0 && (
                  <div className="cl-entry-links">
                    {p.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener">
                        {l.label} <ArrowUpRight size={13} />
                      </a>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </Section>
        )}

        {awards.length > 0 && (
          <Section id="achievements" kicker="04 — Recognition" title="Achievements">
            <div className="cl-award-grid">
              {awards.map((a, i) => (
                <Reveal key={a.title} className="cl-award" delay={i * 55}>
                  <h3 className="cl-entry-title">
                    <Sparkles size={15} className="cl-accent" /> {a.title}
                  </h3>
                  <p className="cl-entry-lead">{a.summary}</p>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {education.length > 0 && (
          <Section id="education" kicker="05 — Studies" title="Education">
            {education.map((e, i) => (
              <Reveal key={e.institution} className="cl-entry cl-entry-compact" delay={i * 55}>
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{e.institution}</h3>
                  <span className="cl-entry-meta">{e.dates}</span>
                </div>
                <p className="cl-entry-lead">
                  {e.degree}
                  {e.score ? ` · ${e.score}` : ""}
                </p>
              </Reveal>
            ))}
          </Section>
        )}

        {volunteer.length > 0 && (
          <Section id="extra" kicker="06 — Beyond work" title="Extra-curricular">
            <div className="cl-award-grid">
              {volunteer.map((v, i) => (
                <Reveal key={v.role} className="cl-award" delay={i * 55}>
                  <h3 className="cl-entry-title">{v.role}</h3>
                  <p className="cl-entry-lead">{v.summary}</p>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        <Section id="contact" kicker="07 — Say hello" title="Let's talk">
          <Reveal className="cl-contact">
            <p>
              Open to internships, research, and genuinely ambitious builds —
              especially anything with agents, evals, or systems at the core.
            </p>
            <div className="cl-hero-actions">
              <a className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}>
                <Mail size={15} /> {basics.email}
              </a>
              {github && (
                <a className="cl-btn" href={github.url} target="_blank" rel="noopener">
                  GitHub <ArrowUpRight size={13} />
                </a>
              )}
              {linkedin && (
                <a className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">
                  LinkedIn <ArrowUpRight size={13} />
                </a>
              )}
              <a className="cl-btn" href="/resume.pdf" download>
                <Download size={14} /> Résumé PDF
              </a>
            </div>
          </Reveal>
        </Section>

        <footer className="cl-footer">
          © 2026 {basics.name} ·{" "}
          <a href="/">the world</a>
        </footer>
      </div>
    </div>
  );
}
