import type { Resume } from "@/content/types";

/**
 * The SSR text core — every résumé section as real, crawlable, semantic HTML.
 * This is what recruiters on slow phones, screen readers, and Google get,
 * unconditionally. It must look good standing alone.
 */
export function ResumeCore({ resume }: { resume: Resume }) {
  const { basics, work, education, projects, awards, skills, volunteer } =
    resume;

  return (
    <main id="text-core" className="rc">
      <header className="rc-header">
        <p className="rc-kicker">✦ Kalpana — the text realm</p>
        <h1>{basics.name}</h1>
        <p className="rc-label">{basics.label}</p>
        <p className="rc-summary">{basics.summary}</p>
        <nav className="rc-links" aria-label="Contact and profiles">
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          {basics.profiles.map((p) => (
            <a key={p.network} href={p.url} rel="me noopener" target="_blank">
              {p.network}
            </a>
          ))}
          <span className="rc-loc">
            {basics.location.city}, {basics.location.region}
          </span>
        </nav>
      </header>

      <section aria-labelledby="h-projects">
        <h2 id="h-projects">Projects</h2>
        {projects.map((proj) => (
          <article key={proj.slug} className="rc-item">
            <h3>{proj.name}</h3>
            <p className="rc-tags">{proj.keywords.join(" · ")}</p>
            <p className="rc-item-summary">{proj.summary}</p>
            <ul>
              {proj.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            {proj.links && (
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
              {fmtRange(w.startDate, w.endDate)}
              {w.location ? ` · ${w.location}` : ""}
            </p>
            {w.summary && <p className="rc-item-summary">{w.summary}</p>}
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
              {e.studyType} in {e.area} · {fmtRange(e.startDate, e.endDate)}
              {e.score ? ` · ${e.score}` : ""}
            </p>
          </article>
        ))}
      </section>

      <section aria-labelledby="h-skills">
        <h2 id="h-skills">Technical Skills &amp; Coursework</h2>
        <dl className="rc-skills">
          {skills.map((g) => (
            <div key={g.name}>
              <dt>{g.name}</dt>
              <dd>{g.keywords.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-extracurricular">
        <h2 id="h-extracurricular">Extra Curricular</h2>
        <ul className="rc-awards">
          {volunteer.map((v) => (
            <li key={v.organization}>
              <strong>
                {v.position}, {v.organization}
              </strong>{" "}
              — {v.summary}
            </li>
          ))}
        </ul>
      </section>

      <footer className="rc-footer">
        <p>
          Built as <strong>Kalpana</strong> (“imagination”) — a voxel world
          with a glowing critter named Kip. If you’re reading this version,
          you still got everything. ✦
        </p>
      </footer>
    </main>
  );
}

function fmtRange(start: string, end?: string) {
  return `${fmtDate(start)} – ${end ? fmtDate(end) : "Present"}`;
}

function fmtDate(iso: string) {
  const [y, m] = iso.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return m ? `${months[parseInt(m, 10) - 1]} ${y}` : y;
}
