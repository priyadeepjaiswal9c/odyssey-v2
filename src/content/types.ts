/**
 * JSON Resume schema + extensions — the APEX→ODYSSEY feed contract (v1).
 * See ../SHARED-INTERFACES.md §1. ODYSSEY is read-only over this shape.
 */

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone?: string;
  location: { city: string; region: string; countryCode: string };
  summary: string;
  profiles: { network: string; username: string; url: string }[];
}

export interface ResumeWork {
  name: string; // company
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  highlights: string[];
}

export interface ResumeEducation {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score?: string;
}

export interface ResumeProject {
  name: string;
  /** short display name used in-world */
  slug: string;
  summary: string;
  highlights: string[];
  keywords: string[];
  url?: string;
  repo?: string;
  links?: { label: string; url: string }[];
}

export interface ResumeAward {
  title: string;
  awarder: string;
  summary: string;
}

export interface ResumeSkillGroup {
  name: string;
  keywords: string[];
}

export interface ResumeVolunteer {
  organization: string;
  position: string;
  summary: string;
}

export interface Resume {
  version: "v1";
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  awards: ResumeAward[];
  skills: ResumeSkillGroup[];
  volunteer: ResumeVolunteer[];
}
