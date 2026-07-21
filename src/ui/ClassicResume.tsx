"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  Download,
  Mail,
  ArrowUpRight,
  ArrowLeft,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { Content } from "@/content/types";

/** fades + lifts a block into view as it scrolls in (progressive enhancement) */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { el.classList.add("is-in"); io.unobserve(el); }
      },
      { threshold: 0.16 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`cl-reveal ${className}`}>
      {children}
    </div>
  );
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="cl-section">
      <Reveal>
        <p className="cl-kicker">{kicker}</p>
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

  return (
    <div className="cl-root">
      <header className="cl-topbar">
        <a className="cl-brand" href="/">{basics.name}</a>
        <nav className="cl-nav">
          <a className="cl-nav-link" href="#skills">Skills</a>
          <a className="cl-nav-link" href="#experience">Experience</a>
          <a className="cl-nav-link" href="#projects">Projects</a>
          <a className="cl-nav-link" href="#achievements">Achievements</a>
          <a className="cl-nav-link" href="#contact">Contact</a>
        </nav>
        <div className="cl-nav-actions">
          <a className="cl-nav-back" href="/"><ArrowLeft size={14} /> World</a>
          <a className="cl-nav-cta" href="/resume.pdf" download><Download size={14} /> PDF</a>
        </div>
      </header>

      <div className="cl-page">
        {/* hero */}
        <Reveal className="cl-hero">
          <p className="cl-kicker">{basics.tagline}</p>
          <h1 className="cl-name">{basics.name}</h1>
          <p className="cl-what">{basics.whatIDo}</p>
          <p className="cl-summary">{basics.summary}</p>
          <p className="cl-meta">
            <MapPin size={14} /> {basics.location}
          </p>
          <div className="cl-hero-actions">
            <a className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}><Mail size={15} /> Email</a>
            {github && <a className="cl-btn" href={github.url} target="_blank" rel="noopener">GitHub <ArrowUpRight size={13} /></a>}
            {linkedin && <a className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">LinkedIn <ArrowUpRight size={13} /></a>}
            <a className="cl-btn" href="/resume.pdf" download><Download size={14} /> PDF</a>
          </div>
        </Reveal>

        {skills.length > 0 && (
          <Section id="skills" kicker="what I work with" title="Skills">
            <div className="cl-skillgroups">
              {skills.map((g) => (
                <Reveal key={g.name} className="cl-skillgroup">
                  <h3 className="cl-skillgroup-name">{g.name}</h3>
                  <div className="cl-chips">
                    {g.keywords.map((k) => (
                      <span key={k} className="cl-chip">{k}</span>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {work.length > 0 && (
          <Section id="experience" kicker="where I've built" title="Experience">
            {work.map((w) => (
              <Reveal key={w.name + w.position} className="cl-entry">
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{w.position} · <span className="cl-accent">{w.name}</span></h3>
                  <span className="cl-entry-meta">{w.dates}{w.location ? ` · ${w.location}` : ""}</span>
                </div>
                <ul className="cl-list">{w.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </Reveal>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" kicker="things I've shipped" title="Projects">
            {projects.map((p) => (
              <Reveal key={p.slug} className="cl-entry">
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{p.name}</h3>
                  <span className="cl-entry-meta">{p.stack}</span>
                </div>
                <p className="cl-entry-lead">{p.oneLiner}</p>
                <ul className="cl-list">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
                {p.links.length > 0 && (
                  <div className="cl-entry-links">
                    {p.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener">{l.label} <ArrowUpRight size={13} /></a>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </Section>
        )}

        {awards.length > 0 && (
          <Section id="achievements" kicker="milestones" title="Achievements">
            {awards.map((a) => (
              <Reveal key={a.title} className="cl-entry cl-entry-compact">
                <h3 className="cl-entry-title"><Sparkles size={15} className="cl-accent" /> {a.title}</h3>
                <p className="cl-entry-lead">{a.summary}</p>
              </Reveal>
            ))}
          </Section>
        )}

        {education.length > 0 && (
          <Section id="education" kicker="the foundation" title="Education">
            {education.map((e) => (
              <Reveal key={e.institution} className="cl-entry cl-entry-compact">
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{e.institution}</h3>
                  <span className="cl-entry-meta">{e.dates}</span>
                </div>
                <p className="cl-entry-lead">{e.degree}{e.score ? ` · ${e.score}` : ""}</p>
              </Reveal>
            ))}
          </Section>
        )}

        {volunteer.length > 0 && (
          <Section id="extra" kicker="beyond the classroom" title="Extra-curricular">
            {volunteer.map((v) => (
              <Reveal key={v.role} className="cl-entry cl-entry-compact">
                <h3 className="cl-entry-title">{v.role}</h3>
                <p className="cl-entry-lead">{v.summary}</p>
              </Reveal>
            ))}
          </Section>
        )}

        <Section id="contact" kicker="say hi" title="Let's talk">
          <Reveal className="cl-contact">
            <p>Internships, research, ambitious builds — if it involves agents, evals, or systems, I want to hear about it.</p>
            <div className="cl-hero-actions">
              <a className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}><Mail size={15} /> {basics.email}</a>
              {github && <a className="cl-btn" href={github.url} target="_blank" rel="noopener">GitHub <ArrowUpRight size={13} /></a>}
              {linkedin && <a className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">LinkedIn <ArrowUpRight size={13} /></a>}
              <a className="cl-btn" href="/resume.pdf" download><Download size={14} /> Résumé PDF</a>
            </div>
          </Reveal>
        </Section>

        <footer className="cl-footer">© 2026 {basics.name} · <a href="/">the world</a></footer>
      </div>
    </div>
  );
}
