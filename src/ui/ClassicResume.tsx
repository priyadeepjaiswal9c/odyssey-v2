"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  motion,
  MotionConfig,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
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

const EASE = [0.22, 1, 0.36, 1] as const;
const VP = { once: true, margin: "0px 0px -10% 0px" } as const;

const vItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const vContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const vWord: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotateX: -55 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.85, ease: EASE } },
};
const vLine: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.6, ease: EASE, delay: 0.1 } },
};

/** every block enters as it scrolls into view */
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={vItem} initial="hidden" whileInView="show" viewport={VP}>
      {children}
    </motion.div>
  );
}

/** orchestrates staggered children */
function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={vContainer} initial="hidden" whileInView="show" viewport={VP}>
      {children}
    </motion.div>
  );
}

function Section({
  id,
  num,
  tag,
  title,
  children,
}: {
  id: string;
  num: string;
  tag: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="cl-section">
      <motion.div
        className="cl-section-head"
        variants={vContainer}
        initial="hidden"
        whileInView="show"
        viewport={VP}
      >
        <motion.p className="cl-kicker" variants={vItem}>
          <span className="cl-kicker-dot" />
          {num} — {tag}
        </motion.p>
        <motion.h2 className="cl-h2" variants={vItem}>
          {title}
          <motion.span className="cl-h2-line" variants={vLine} />
        </motion.h2>
      </motion.div>
      {children}
    </section>
  );
}

export function ClassicResume({ content }: { content: Content }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }}>
        <ClassicBody content={content} />
      </ReactLenis>
    </MotionConfig>
  );
}

function ClassicBody({ content }: { content: Content }) {
  const { basics, work, education, projects, awards, skills, volunteer } = content;
  const github = basics.profiles.find((p) => p.network === "GitHub");
  const linkedin = basics.profiles.find((p) => p.network === "LinkedIn");

  // — theme (dark-first; remembered) —
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cl-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* private mode */
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

  // — smooth-scrolled anchor nav + scroll-spy —
  const lenis = useLenis();
  const go = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      lenis?.scrollTo(`#${id}`, { offset: -70, duration: 1.1 });
    },
    [lenis]
  );
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
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

  // — scroll-linked motion: progress bar + aurora parallax —
  const { scrollY, scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const ay1 = useTransform(scrollY, [0, 3000], [0, 260], { clamp: false });
  const ay2 = useTransform(scrollY, [0, 3000], [0, -170], { clamp: false });
  const ay3 = useTransform(scrollY, [0, 3000], [0, 210], { clamp: false });

  return (
    <div className="cl-root cl-body" data-theme={theme}>
      <noscript>
        <style>{`.cl-page [style]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <motion.div className="cl-progress" style={{ scaleX: progressX }} aria-hidden />

      <div className="cl-aurora" aria-hidden>
        <motion.div className="cl-aura-layer cl-aura-a" style={{ y: ay1 }}>
          <span className="cl-aura-blob" />
        </motion.div>
        <motion.div className="cl-aura-layer cl-aura-b" style={{ y: ay2 }}>
          <span className="cl-aura-blob" />
        </motion.div>
        <motion.div className="cl-aura-layer cl-aura-c" style={{ y: ay3 }}>
          <span className="cl-aura-blob" />
        </motion.div>
      </div>

      <header className="cl-topbar">
        <a className="cl-brand" href="/">
          {basics.name}
        </a>
        <nav className="cl-nav">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => go(e, n.id)}
              className={`cl-nav-link ${active === n.id ? "is-active" : ""}`}
            >
              {active === n.id && (
                <motion.span
                  layoutId="cl-nav-pill"
                  className="cl-nav-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="cl-nav-label">{n.label}</span>
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="cl-theme-icon"
                initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </motion.span>
            </AnimatePresence>
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
        {/* hero — orchestrated page-load reveal */}
        <motion.header className="cl-hero" variants={vContainer} initial="hidden" animate="show">
          <motion.p className="cl-kicker" variants={vItem}>
            <span className="cl-kicker-dot" />
            {basics.tagline}
          </motion.p>
          <motion.h1 className="cl-name" variants={vContainer}>
            {basics.name.split(" ").map((w, i) => (
              <motion.span className="cl-word" variants={vWord} key={i}>
                {w}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p className="cl-what" variants={vItem}>
            {basics.whatIDo}
          </motion.p>
          <motion.p className="cl-summary" variants={vItem}>
            {basics.summary}
          </motion.p>
          <motion.p className="cl-meta" variants={vItem}>
            <MapPin size={14} /> {basics.location}
          </motion.p>
          <motion.div className="cl-hero-actions" variants={vItem}>
            <MotionLink className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}>
              <Mail size={15} /> Email
            </MotionLink>
            {github && (
              <MotionLink className="cl-btn" href={github.url} target="_blank" rel="noopener">
                GitHub <ArrowUpRight size={13} />
              </MotionLink>
            )}
            {linkedin && (
              <MotionLink className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">
                LinkedIn <ArrowUpRight size={13} />
              </MotionLink>
            )}
            <MotionLink className="cl-btn" href="/resume.pdf" download>
              <Download size={14} /> PDF
            </MotionLink>
          </motion.div>
        </motion.header>

        {skills.length > 0 && (
          <Section id="skills" num="01" tag="Toolkit" title="Skills">
            <Stagger className="cl-skillgroups">
              {skills.map((g) => (
                <motion.div className="cl-skillgroup" variants={vItem} key={g.name}>
                  <h3 className="cl-skillgroup-name">{g.name}</h3>
                  <p className="cl-skill-list">
                    {g.keywords.map((k, i) => (
                      <span key={k} className="cl-skill">
                        {k}
                        {i < g.keywords.length - 1 && (
                          <span className="cl-skill-sep">{" · "}</span>
                        )}
                      </span>
                    ))}
                  </p>
                </motion.div>
              ))}
            </Stagger>
          </Section>
        )}

        {work.length > 0 && (
          <Section id="experience" num="02" tag="Career" title="Experience">
            {work.map((w) => (
              <motion.div
                key={w.name + w.position}
                className="cl-entry"
                variants={vItem}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                whileHover={{ x: 6 }}
              >
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
              </motion.div>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" num="03" tag="Selected builds" title="Projects">
            {projects.map((p) => (
              <motion.div
                key={p.slug}
                className="cl-entry"
                variants={vItem}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                whileHover={{ x: 6 }}
              >
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
              </motion.div>
            ))}
          </Section>
        )}

        {awards.length > 0 && (
          <Section id="achievements" num="04" tag="Recognition" title="Achievements">
            {awards.map((a) => (
              <motion.div
                key={a.title}
                className="cl-entry cl-entry-compact"
                variants={vItem}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                whileHover={{ x: 6 }}
              >
                <h3 className="cl-entry-title">
                  <Sparkles size={15} className="cl-accent" /> {a.title}
                </h3>
                <p className="cl-entry-lead">{a.summary}</p>
              </motion.div>
            ))}
          </Section>
        )}

        {education.length > 0 && (
          <Section id="education" num="05" tag="Studies" title="Education">
            {education.map((e) => (
              <motion.div
                key={e.institution}
                className="cl-entry cl-entry-compact"
                variants={vItem}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                whileHover={{ x: 6 }}
              >
                <div className="cl-entry-head">
                  <h3 className="cl-entry-title">{e.institution}</h3>
                  <span className="cl-entry-meta">{e.dates}</span>
                </div>
                <p className="cl-entry-lead">
                  {e.degree}
                  {e.score ? ` · ${e.score}` : ""}
                </p>
              </motion.div>
            ))}
          </Section>
        )}

        {volunteer.length > 0 && (
          <Section id="extra" num="06" tag="Beyond work" title="Extra-curricular">
            {volunteer.map((v) => (
              <motion.div
                key={v.role}
                className="cl-entry cl-entry-compact"
                variants={vItem}
                initial="hidden"
                whileInView="show"
                viewport={VP}
                whileHover={{ x: 6 }}
              >
                <h3 className="cl-entry-title">{v.role}</h3>
                <p className="cl-entry-lead">{v.summary}</p>
              </motion.div>
            ))}
          </Section>
        )}

        <Section id="contact" num="07" tag="Say hello" title="Let's talk">
          <Reveal className="cl-contact">
            <p>
              Open to internships, research, and genuinely ambitious builds —
              especially anything with agents, evals, or systems at the core.
            </p>
            <div className="cl-hero-actions">
              <MotionLink className="cl-btn cl-btn-primary" href={`mailto:${basics.email}`}>
                <Mail size={15} /> {basics.email}
              </MotionLink>
              {github && (
                <MotionLink className="cl-btn" href={github.url} target="_blank" rel="noopener">
                  GitHub <ArrowUpRight size={13} />
                </MotionLink>
              )}
              {linkedin && (
                <MotionLink className="cl-btn" href={linkedin.url} target="_blank" rel="noopener">
                  LinkedIn <ArrowUpRight size={13} />
                </MotionLink>
              )}
              <MotionLink className="cl-btn" href="/resume.pdf" download>
                <Download size={14} /> Résumé PDF
              </MotionLink>
            </div>
          </Reveal>
        </Section>

        <footer className="cl-footer">
          © 2026 {basics.name} · <a href="/">the world</a>
        </footer>
      </div>
    </div>
  );
}

/** an anchor with a springy hover/tap — used for every button */
function MotionLink({
  children,
  className,
  href,
  target,
  rel,
  download,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
  download?: boolean;
}) {
  return (
    <motion.a
      className={className}
      href={href}
      target={target}
      rel={rel}
      download={download}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.a>
  );
}
