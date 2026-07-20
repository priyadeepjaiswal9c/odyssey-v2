"use client";

import { usePathname } from "next/navigation";
import { ArrowRight, Download, FileText } from "lucide-react";
import type { Content } from "@/content/types";
import { useWorld, type RealmId } from "@/world/store";

/**
 * The entry — one clean hero. Name, a line about the work, and a single
 * way in. Deep links (/projects/<slug>, /experience, …) enter straight there.
 */
export function EntryGate({ content }: { content: Content }) {
  const phase = useWorld((s) => s.phase);
  const pathname = usePathname();
  const { basics } = content;

  if (phase !== "gate") return null;

  const enter = () => {
    const seg = pathname.split("/").filter(Boolean);
    const st = useWorld.getState();
    if (seg[0] === "projects" && seg[1]) {
      st.enterWorld("projects");
      st.goToStopId(`${seg[1]}-showcase`);
    } else if (["experience", "achievements", "about"].includes(seg[0])) {
      st.enterWorld(seg[0] as RealmId);
    } else {
      st.enterWorld("hub"); // straight into the world — no second menu
    }
  };

  return (
    <div className="gate" role="dialog" aria-label="Welcome">
      <div className="gate-inner">
        <p className="gate-kicker">{basics.tagline}</p>
        <h1 className="gate-name">{basics.name}</h1>
        <p className="gate-what">{basics.whatIDo}</p>
        <button className="gate-enter" onClick={enter}>
          Enter the world <ArrowRight size={18} />
        </button>
        <div className="gate-links">
          <a href="/resume.pdf" download>
            <Download size={14} /> Résumé PDF
          </a>
          <a href="/classic">
            <FileText size={14} /> Read as text
          </a>
        </div>
      </div>
    </div>
  );
}
