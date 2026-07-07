import type { Content } from "@/content/types";

/**
 * The SSR text core — every résumé section as real, crawlable, semantic
 * HTML. Rendered under the world AND as the body of /classic (the
 * recruiter fast lane). Must be excellent standing alone.
 */
export function ResumeCore({
  content,
  classic = false,
}: {
  content: Content;
  classic?: boolean;
}) {
  const { basics, work, education, projects, awards, skills, volunteer } =
    content;

  return (
    <main id="text-core" className="rc">
      <header className="rc-header">
        <p className="rc-kicker">
          {classic ? "classic view" : "text version"} · {basics.tagline}
        </p>
        <h1>{basics.name}</h1>
        <p className="rc-label">{basics.whatIDo}</p>
        <p className="rc-summary">{basics.summary}</p>
        <nav className="rc-links" aria-label="Contact and profiles">
          <a className="rc-btn" href="/resume.pdf" download>
            ⬇ Résumé (PDF)
          </a>
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          {basics.profiles.map((p) => (
            <a key={p.network} href={p.url} rel="me noopener" target="_blank">
              {p.network}
            </a>
          ))}
          <span className="rc-loc">{basics.location}</span>
          {!classic && <a href="/classic">Classic view →</a>}
        </nav>
      </header>

      {/* skills index first in classic view — recruiters scan keywords */}
      <section aria-labelledby="h-skills">
        <h2 id="h-skills">Skills Index</h2>
        <dl className="rc-skills">
          {skills.map((g) => (
            <div key={g.name}>
              <dt>{g.name}</dt>
              <dd>{g.keywords.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-projects">
        <h2 id="h-projects">Projects</h2>
        {projects.map((proj) => (
          <article key={proj.slug} className="rc-item" id={`project-${proj.slug}`}>
            <h3>{proj.name}</h3>
            <p className="rc-tags">{proj.stack}</p>
            <p className="rc-item-summary">{proj.oneLiner}</p>
            <ul>
              {proj.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            {proj.links.length > 0 && (
              <p className="rc-item-links">
                {proj.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener">
                    {l.label} ↗
                  </a>
                ))}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="h-experience">
        <h2 id="h-experience">Experience</h2>
        {work.map((w) => (
          <article key={w.name} className="rc-item">
            <h3>
              {w.position} · {w.name}
            </h3>
            <p className="rc-tags">
              {w.dates}
              {w.location ? ` · ${w.location}` : ""}
            </p>
            <ul>
              {w.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="h-achievements">
        <h2 id="h-achievements">Achievements</h2>
        <ul className="rc-awards">
          {awards.map((a) => (
            <li key={a.title}>
              <strong>{a.title}</strong> — {a.summary}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="h-education">
        <h2 id="h-education">Education</h2>
        {education.map((e) => (
          <article key={e.institution} className="rc-item">
            <h3>{e.institution}</h3>
            <p className="rc-tags">
              {e.degree} · {e.dates}
              {e.score ? ` · ${e.score}` : ""}
            </p>
          </article>
        ))}
      </section>

      <section aria-labelledby="h-extracurricular">
        <h2 id="h-extracurricular">Extra Curricular</h2>
        <ul className="rc-awards">
          {volunteer.map((v) => (
            <li key={v.role}>
              <strong>{v.role}</strong> — {v.summary}
            </li>
          ))}
        </ul>
      </section>

      <footer className="rc-footer">
        <p>
          {classic ? (
            <>
              Prefer the scenic route? <a href="/">Enter the voxel world ✦</a>
            </>
          ) : (
            <>
              This is the fast lane. The voxel world above has the same story
              with god-rays. ✦
            </>
          )}
        </p>
      </footer>
    </main>
  );
}
