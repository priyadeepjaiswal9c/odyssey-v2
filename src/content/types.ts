/**
 * The site's content shape — produced by `scripts/parse-resume.mjs` from
 * `../main.tex` into `src/content/content.json`, and the shape the APEX
 * feed publishes (versioned v1, JSON-Resume-derived; see
 * ../SHARED-INTERFACES.md). Components never hardcode content.
 */

export interface ContentBasics {
  name: string;
  /** one-line "what I do" for the gate + classic view */
  whatIDo: string;
  /** blocky tagline under the menu logo */
  tagline: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  profiles: { network: string; url: string }[];
  /** top-3 for the entry gate */
  topSkills: string[];
}

export interface ContentWork {
  name: string;
  position: string;
  dates: string;
  location?: string;
  highlights: string[];
}

export interface ContentEducation {
  institution: string;
  degree: string;
  dates: string;
  score?: string;
}

export interface ContentProject {
  name: string;
  slug: string;
  /** one-liner for panels + gate */
  oneLiner: string;
  /** stack string — doubles as keywords */
  stack: string;
  links: { label: string; url: string }[];
  /** path under /public — may not exist (placeholder panel renders) */
  screenshot: string;
  highlights: string[];
  keywords: string[];
}

export interface ContentAward {
  title: string;
  summary: string;
}

export interface ContentSkillGroup {
  name: string;
  keywords: string[];
}

export interface ContentVolunteer {
  role: string;
  summary: string;
}

export interface Content {
  version: "v1";
  generatedFrom?: string;
  basics: ContentBasics;
  work: ContentWork[];
  education: ContentEducation[];
  projects: ContentProject[];
  awards: ContentAward[];
  skills: ContentSkillGroup[];
  volunteer: ContentVolunteer[];
}
