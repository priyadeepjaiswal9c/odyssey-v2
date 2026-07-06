import type { Resume } from "./types";

/**
 * Seed content, transcribed from ../main.tex (2026-07).
 * At build time the loader prefers an APEX `feed.json` if present (same shape).
 */
export const seedResume: Resume = {
  version: "v1",
  basics: {
    name: "Priyadeep Jaiswal",
    label: "AI Engineer · Builder of agents, pipelines & playful worlds",
    email: "priyadeep_2401ec10@iitp.ac.in",
    phone: "+91-7827555207",
    location: { city: "Noida", region: "Uttar Pradesh", countryCode: "IN" },
    summary:
      "ECE undergrad at IIT Patna who ships production AI systems — LLM voice agents, OCR/LLM benchmark suites, multi-agent apps — and has entirely too much fun doing it.",
    profiles: [
      {
        network: "LinkedIn",
        username: "priyadeep-jaiswal",
        url: "https://www.linkedin.com/in/priyadeep-jaiswal-39ab001b5/",
      },
      {
        network: "GitHub",
        username: "priyadeepjaiswal9c",
        url: "https://github.com/priyadeepjaiswal9c",
      },
    ],
  },
  work: [
    {
      name: "Windflow.ai",
      position: "AI Engineering Intern",
      location: "Gurgaon, India",
      startDate: "2026-05",
      endDate: "2026-07",
      summary:
        "Shipped production LLM systems end-to-end: voice agents, evaluation benchmarks, forecasting studies, cost analytics.",
      highlights: [
        "Shipped a production LLM voice interviewer on GCP Cloud Run probing agents on 4 diagnostic pillars.",
        "Unified 14 OCR engines and 9 LLM extractors into a single benchmark suite with 250+ automated tests.",
        "Evaluated a 20-model forecasting zoo on 12 public datasets; GBMs beat seasonal-naive by 9–18% on RMSSE.",
        "Led a pre-registered A/B study on 5 paired builds; measured 4–5% token savings, advised against adoption.",
        "Developed a human-in-the-loop golden pipeline: ROVER voting, Dawid–Skene EM, and LLM arbitration.",
        "Instrumented per-call LLM cost analytics (Langfuse, LiteLLM) on a PostgreSQL backend with abuse detection.",
      ],
    },
  ],
  education: [
    {
      institution: "Indian Institute of Technology, Patna",
      area: "Electronics and Communication Engineering",
      studyType: "Bachelor of Technology",
      startDate: "2024-07",
      endDate: "2028-05",
      score: "CPI 7.55",
    },
    {
      institution: "The Vivekanada School Narela, Delhi",
      area: "Class 12th, PCM",
      studyType: "Senior Secondary",
      startDate: "2022-04",
      endDate: "2024-05",
      score: "90.8%",
    },
  ],
  projects: [
    {
      name: "Meridian — Multi-Agent Energy Supply-Chain AI",
      slug: "meridian",
      summary:
        "A multi-agent crisis-response app that watches the world's energy arteries on a live geospatial map and reroutes around trouble.",
      highlights: [
        "Built a multi-agent crisis-response app in 2.4K LOC TypeScript with 12 components and 3 sim engines.",
        "Wired 4 live data APIs (EIA, GDELT, OFAC, AISStream) into a real-time deck.gl geospatial dashboard.",
        "Modeled a 6-metric economic cascade with a sanctions-compliance layer vetting 3 reroutes per crisis.",
      ],
      keywords: ["Next.js", "TypeScript", "deck.gl", "Multi-agent"],
      repo: "https://github.com/priyadeepjaiswal9c",
      links: [{ label: "GitHub", url: "https://github.com/priyadeepjaiswal9c" }],
    },
    {
      name: "TARK AI — Legal Assistant & Contract Generator",
      slug: "tark",
      summary:
        "An AI legal assistant where a Generator drafts and a Challenger fact-checks every answer — then renders real contracts to PDF.",
      highlights: [
        "Co-developed (team of 4) an AI legal assistant serving 3 user personas that auto-generates legal contracts.",
        "Architected a 2-stage Generator–Challenger LLM pipeline where a fact-checker model verifies every answer.",
        "Programmed 6+ parameterized legal templates (NDA, rent, partnership) that auto-render LaTeX to PDF.",
        "Instrumented audit-mode JSON logging and a 5-turn conversation memory capturing every model decision.",
      ],
      keywords: ["Python", "Ollama", "LaTeX", "LLM pipeline"],
      repo: "https://github.com/Harsh-B25/Legal-Assistant",
      links: [
        { label: "GitHub", url: "https://github.com/Harsh-B25/Legal-Assistant" },
        {
          label: "Pitch Deck",
          url: "https://github.com/Harsh-B25/Legal-Assistant/blob/main/CYF1396_Team%20Name_phase1_Presentation.pdf",
        },
      ],
    },
    {
      name: "Campus Cab Pooling Platform — IIT Patna",
      slug: "campuscab",
      summary:
        "A desktop ride-pooling app for campus life — fuzzy search, festival routes, and a tidy MVC core.",
      highlights: [
        "Built a ~900-LOC MVC desktop app (Python) for campus ride pooling across 3 route types and festivals.",
        "Modeled a normalized 3-table SQLite schema with SHA-256 password hashing and credential validation.",
        "Engineered 3 search modes: fuzzy Levenshtein matching, date-range queries, and popular-route analytics.",
      ],
      keywords: ["Python", "PyQt5", "SQLite", "MVC"],
      repo: "https://github.com/priyadeepjaiswal9c/Cab_Pooling_Application",
      links: [
        {
          label: "GitHub",
          url: "https://github.com/priyadeepjaiswal9c/Cab_Pooling_Application",
        },
        {
          label: "Presentation",
          url: "https://github.com/priyadeepjaiswal9c/Cab_Pooling_Application/blob/main/cab_pooling_submission/Cab_Pooling_Application_Presentation.pdf",
        },
      ],
    },
  ],
  awards: [
    {
      title: "Amazon ML Summer School 2026",
      awarder: "Amazon",
      summary:
        "Selected in top 3,000 of 1,34,000+ applicants (~2% selection rate).",
    },
    {
      title: "JEE Advanced 2024 — AIR 5673",
      awarder: "IIT JEE",
      summary:
        "Secured All India Rank 5673 among the top 2.5 lakh shortlisted JEE Mains qualifiers.",
    },
    {
      title: "JEE Mains 2024 — 98.7 percentile",
      awarder: "NTA",
      summary:
        "Scored 98.7 percentile (All India Rank 19903) among 1.5 million candidates nationwide.",
    },
    {
      title: "Inter IIT Cultural Meet 7.0 — Bronze, Stageplay",
      awarder: "Inter IIT",
      summary:
        "Won the Bronze medal in Stageplay, competing against teams from all 23 IITs.",
    },
  ],
  skills: [
    {
      name: "Programming",
      keywords: ["Python", "TypeScript", "JavaScript", "C++", "C", "SQL", "Bash"],
    },
    {
      name: "AI/ML",
      keywords: [
        "LLM Pipeline Design",
        "Agentic Systems",
        "Prompt Engineering",
        "STT (Whisper, Sarvam)",
        "LightGBM",
      ],
    },
    {
      name: "Frameworks & Databases",
      keywords: [
        "Next.js",
        "React",
        "Node.js/Express",
        "FastAPI",
        "Prisma",
        "PostgreSQL",
        "SQLite",
        "PyQt5",
      ],
    },
    {
      name: "Cloud & Tools",
      keywords: [
        "GCP (Cloud Run, Cloud SQL, Secret Manager)",
        "Docker",
        "Langfuse",
        "Git",
        "Figma",
        "LaTeX",
      ],
    },
    {
      name: "Concepts",
      keywords: [
        "MVC Architecture",
        "Modular System Design",
        "Database Schema Design",
        "REST APIs",
        "OOP",
        "DSA",
        "PRD",
      ],
    },
    {
      name: "Coursework",
      keywords: [
        "Data Structures",
        "Signals & Systems",
        "Probability",
        "Linear Algebra",
        "Statistics",
        "Complex Analysis",
      ],
    },
  ],
  volunteer: [
    {
      organization: "TEDxIITPatna",
      position: "Planning & Curation Sub-Coordinator",
      summary:
        "Curated 8 speakers from 1,000+ contacts for a 300+ attendee TEDx event.",
    },
    {
      organization: "Yavanika (Dramatics Society)",
      position: "Sub-Coordinator",
      summary:
        "Managed a 50-member cast across 5 productions; acted in 2 plays.",
    },
    {
      organization: "National Service Scheme, IIT Patna",
      position: "Volunteer",
      summary:
        "Mentored 100+ students across 2 schools over 2 semesters via labs & wellness drives.",
    },
  ],
};
