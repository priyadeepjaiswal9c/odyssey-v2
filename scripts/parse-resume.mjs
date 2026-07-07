#!/usr/bin/env node
/**
 * Parses ../main.tex (Jake-template résumé) into src/content/content.json —
 * the single content source the whole site builds from (FINAL ADDENDUM).
 *
 * World-specific enrichments (slugs, one-liners, screenshot slots) are keyed
 * here so they land in content.json too — components stay content-free.
 * Missing real-world data (live URLs, screenshots) becomes explicit TODOs
 * in CONTENT-TODO.md — never invented.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawTex = readFileSync(resolve(root, "../main.tex"), "utf-8");
// strip LaTeX comments (unescaped % to end of line) — commented-out sections
// otherwise shadow the real ones
const tex = rawTex.replace(/(?<!\\)%.*$/gm, "");

// ——— LaTeX → text cleanup ———
function clean(s) {
  return s
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\small|\\item|\\underline\{([^}]*)\}/g, "$1" ?? "")
    .replace(/\\underline\{([^}]*)\}/g, "$1")
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\\$/g, "$")
    .replace(/\\_/g, "_")
    .replace(/\$\\sim\$/g, "~")
    .replace(/\$\|\$/g, "|")
    .replace(/--/g, "–")
    .replace(/\{|\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hrefs(block) {
  const out = [];
  const re = /\\href\{([^}]*)\}\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let m;
  while ((m = re.exec(block))) out.push({ url: m[1].replace(/\\/g, ""), label: clean(m[2]) });
  return out;
}

function items(block) {
  const out = [];
  const re = /\\resumeItem\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  let m;
  while ((m = re.exec(block))) out.push(clean(m[1]));
  return out;
}

const todos = [];

/** extract balanced-brace content starting right after `start` index (at '{') */
function balanced(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return "";
}

/** all `\item{...}` bodies in a block (brace-safe), split into bold lead + rest */
function boldItems(block) {
  const out = [];
  let idx = 0;
  while ((idx = block.indexOf("\\item{", idx)) !== -1) {
    const body = balanced(block, idx + 5);
    idx += 6;
    const bold = body.match(/^\\textbf\{/);
    if (bold) {
      const title = balanced(body, body.indexOf("{"));
      const rest = body.slice(body.indexOf("{") + title.length + 2);
      out.push({ title: clean(title).replace(/:$/, ""), summary: clean(rest) });
    } else {
      out.push({ title: "", summary: clean(body) });
    }
  }
  return out;
}

// ——— basics ———
const name = clean((tex.match(/\\Huge \\scshape ([^}]*)\}/) ?? [])[1] ?? "");
const phone = ((tex.match(/faPhone\\?\s*([+\d-]+)/) ?? [])[1] ?? "").trim();
const email = ((tex.match(/mailto:([^}]*)\}/) ?? [])[1] ?? "").replace(/\\/g, "");
const linkedin = ((tex.match(/\{(https:\/\/www\.linkedin\.com[^}]*)\}/) ?? [])[1] ?? "");
const github = ((tex.match(/\{(https:\/\/github\.com\/[^}/]*)\}/) ?? [])[1] ?? "");
const locLine = clean((tex.match(/\\end\{center\}[\s\S]*?/) ? (tex.match(/\}\s*\\\\ \\vspace\{1pt\}\s*([^\\]*)\\\\/) ?? [])[1] ?? "" : ""));

// ——— sections ———
const section = (nameRe) => {
  const re = new RegExp(`\\\\section\\{${nameRe}\\}([\\s\\S]*?)(?=\\\\section\\{|\\\\end\\{document\\})`);
  return (tex.match(re) ?? [])[1] ?? "";
};

// education
const eduBlock = section("Education");
const education = [];
{
  const re = /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  let m;
  while ((m = re.exec(eduBlock))) {
    education.push({
      institution: clean(m[1]),
      dates: clean(m[2]),
      degree: clean(m[3]),
      score: clean(m[4]),
    });
  }
}

// experience
const expBlock = section("Experience");
const work = [];
{
  const re = /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}([\s\S]*?)(?=\\resumeSubheading|\\resumeSubHeadingListEnd)/g;
  let m;
  while ((m = re.exec(expBlock))) {
    work.push({
      name: clean(m[1]),
      dates: clean(m[2]),
      position: clean(m[3]),
      location: clean(m[4]),
      highlights: items(m[5]),
    });
  }
}

// projects — enrichment table keyed by name prefix
const ENRICH = {
  Meridian: {
    slug: "meridian",
    oneLiner: "Multi-agent AI that watches the world's energy supply chains and reroutes around crises.",
  },
  TARK: {
    slug: "tark",
    oneLiner: "An AI legal assistant where a Generator drafts and a Challenger fact-checks every answer.",
  },
  "Campus Cab": {
    slug: "campuscab",
    oneLiner: "Campus ride-pooling with fuzzy search, festival routes, and a tidy MVC core.",
  },
};

const projBlock = section("Projects");
const projects = [];
{
  const re = /\\resumeProjectHeading\s*\{([\s\S]*?)\}\{\}\s*\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/g;
  let m;
  while ((m = re.exec(projBlock))) {
    const head = m[1];
    const nameMatch = head.match(/\\textbf\{([^}]*)\}/);
    const fullName = clean(nameMatch?.[1] ?? "Untitled");
    const stackMatch = head.match(/\$\|\$\s*\\emph\{([^}]*)\}/);
    const stack = clean(stackMatch?.[1] ?? "");
    const links = hrefs(head).map((l) => ({
      label:
        l.label.replace(/[^A-Za-z ]/g, "").replace(/^textbf/, "").trim() ||
        "Link",
      url: l.url,
    }));
    const key = Object.keys(ENRICH).find((k) => fullName.startsWith(k));
    const enrich = key ? ENRICH[key] : null;
    const slug = enrich?.slug ?? fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
    if (!enrich) todos.push(`Project "${fullName}": no world enrichment (slug/one-liner) — add to scripts/parse-resume.mjs ENRICH`);
    const gh = links.find((l) => /github/i.test(l.label));
    if (gh && !/\/[^/]+\/[^/]+$/.test(gh.url.replace(/\/$/, "")))
      todos.push(`Project "${fullName}": GitHub link points to a profile, not a repo (${gh.url}) — provide the real repo URL`);
    todos.push(`Project "${fullName}": no live/demo URL in main.tex — provide one if it exists`);
    todos.push(`Project "${fullName}": no screenshot — using stylized placeholder panel; drop a real image at public/screenshots/${slug}.png`);
    projects.push({
      name: fullName,
      slug,
      oneLiner: enrich?.oneLiner ?? clean(m[2]).slice(0, 120),
      stack,
      links,
      screenshot: `/screenshots/${slug}.png`, // may not exist → placeholder rendered
      highlights: items(m[2]),
      keywords: stack.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }
}

// achievements (brace-safe: summaries contain nested \textbf)
const achBlock = section("Achievements");
const awards = boldItems(achBlock).filter((a) => a.title);

// skills — each row is `\textbf{Name:}{ keywords } \\`; keywords may contain
// \& and parenthesized commas
function smartSplit(s) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

const skillsBlock = section("Technical Skills[^}]*");
const skills = [];
{
  const re = /\\textbf\{([^}]*):\}\s*\{?\s*([\s\S]*?)\\\\/g;
  let m;
  while ((m = re.exec(skillsBlock))) {
    const nm = clean(m[1]);
    const kws = smartSplit(clean(m[2]));
    if (kws.length) skills.push({ name: nm, keywords: kws });
  }
}

// extracurricular (brace-safe)
const extraBlock = section("Extra Curricular");
const volunteer = boldItems(extraBlock)
  .filter((v) => v.title)
  .map((v) => ({ role: v.title, summary: v.summary }));

// ——— assemble ———
const content = {
  version: "v1",
  generatedFrom: "../main.tex",
  basics: {
    name,
    whatIDo: "AI engineer — I ship LLM agents, evaluation pipelines, and playful full-stack systems.",
    tagline: "Portfolio · ECE, IIT Patna",
    email,
    phone,
    location: "Noida, Uttar Pradesh, IN",
    summary:
      "ECE undergrad at IIT Patna who ships production AI systems — LLM voice agents, OCR/LLM benchmark suites, multi-agent apps — and has entirely too much fun doing it.",
    profiles: [
      { network: "GitHub", url: github },
      { network: "LinkedIn", url: linkedin },
    ],
    topSkills: ["LLM Pipeline Design", "Agentic Systems", "TypeScript/Python"],
  },
  work,
  education,
  projects,
  awards,
  skills,
  volunteer,
};

// ——— sanity gates: fail loudly, never ship an empty site ———
const assert = (cond, msg) => {
  if (!cond) {
    console.error(`✗ parse failed: ${msg}`);
    process.exit(1);
  }
};
assert(name.length > 3, "name");
assert(email.includes("@"), "email");
assert(projects.length >= 3, `projects (${projects.length})`);
assert(work.length >= 1, "work");
assert(awards.length >= 3, `awards (${awards.length})`);
assert(skills.length >= 4, `skills (${skills.length})`);
assert(volunteer.length >= 3, `volunteer (${volunteer.length})`);
assert(education.length >= 1, "education");
assert(projects.every((p) => p.highlights.length > 0), "project highlights");

writeFileSync(
  resolve(root, "src/content/content.json"),
  JSON.stringify(content, null, 2)
);

writeFileSync(
  resolve(root, "CONTENT-TODO.md"),
  `# CONTENT TODO — for the owner\n\n*Generated by scripts/parse-resume.mjs — items the résumé doesn't provide. Nothing here is invented.*\n\n${todos.map((t) => `- [ ] ${t}`).join("\n")}\n`
);

console.log(
  `✓ content.json written — ${projects.length} projects, ${work.length} roles, ${awards.length} awards, ${skills.length} skill groups, ${volunteer.length} activities, ${education.length} education`
);
console.log(`✓ CONTENT-TODO.md — ${todos.length} items for the owner`);
