"use client";

import { usePathname } from "next/navigation";
import type { Content } from "@/content/types";
import { useWorld, type RealmId } from "@/world/store";

/**
 * The entry gate — a one-screen summary shown while the world loads.
 * Recruiters get everything that matters in five seconds; explorers click
 * Enter. Never a bare loader, never a trap: every link works immediately.
 */
export function EntryGate({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);
  const openMenu = useWorld((s) => s.openMenu);
  const pathname = usePathname();
  const { basics, projects } = content;

  if (phase !== "gate") return null;

  const github = basics.profiles.find((p) => p.network === "GitHub");

  // deep links skip the menu: /experience, /achievements, /about,
  // /projects/<slug> → enter straight into that destination
  const enter = () => {
    const seg = pathname.split("/").filter(Boolean);
    const st = useWorld.getState();
    if (seg[0] === "projects" && seg[1]) {
      st.enterWorld("projects");
      st.goToStopId(`${seg[1]}-showcase`);
    } else if (["experience", "achievements", "about"].includes(seg[0])) {
      st.enterWorld(seg[0] as RealmId);
    } else {
      openMenu();
    }
  };

  return (
    <div className="gate" role="dialog" aria-label="Welcome">
      <div className="gate-card">
        <p className="gate-kicker">{basics.tagline}</p>
        <h1 className="gate-name">{basics.name}</h1>
        <p className="gate-what">{basics.whatIDo}</p>

        <div className="gate-row">
          <div className="gate-col">
            <h2>Top skills</h2>
            <ul>
              {basics.topSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="gate-col">
            <h2>Top projects</h2>
            <ul>
              {projects.slice(0, 3).map((p) => (
                <li key={p.slug}>
                  {p.name.split("–")[0].split("—")[0].trim()}
                  <small> · {p.stack}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gate-links">
          <a href="/resume.pdf" download>
            ⬇ Résumé
          </a>
          {github && (
            <a href={github.url} target="_blank" rel="noopener">
              GitHub
            </a>
          )}
          <a href={`mailto:${basics.email}`}>Contact</a>
        </div>

        <div className="gate-actions">
          <button className="mc-btn gate-enter" onClick={enter}>
            Enter world ✦
          </button>
          <a className="mc-btn gate-resume" href="/classic">
            View résumé
          </a>
        </div>
      </div>
    </div>
  );
}
