import type { Metadata } from "next";
import { getContent } from "@/content/loader";
import { ClassicResume } from "@/ui/ClassicResume";

export const metadata: Metadata = {
  title: "Priyadeep Jaiswal — Résumé (Classic view)",
  description:
    "Fast, scannable résumé for Priyadeep Jaiswal — AI engineer, ECE @ IIT Patna. Skills index, projects, experience, achievements, PDF download.",
  alternates: { canonical: "/classic" },
};

/** The recruiter fast lane — everything, scannable, zero WebGL. */
export default async function ClassicPage() {
  const content = await getContent();
  return <ClassicResume content={content} />;
}
