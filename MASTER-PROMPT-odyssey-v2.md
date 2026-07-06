# odyssey-v2 (Kalpana) — Master Build Prompt (one-shot · whole-scope · autonomous)

*Paste into a fresh Fable 5 session (effort high→max). Scope source of truth: `ideation-odyssey-v2.md`
in this folder. Full execution rules: `../00-BUILD-PLAN.md`. This is a **new, separate** project from the
original ODYSSEY (leave that one to finish on its own).*

---

## Mission

Build **Kalpana** — a cozy, generational-quality **voxel portfolio world** you tour — production-grade
and deployed, end-to-end in one continuous autonomous run. Bar: **Awwwards Site-of-the-Year.** Own the
whole assignment; do **not** stop for the human except to queue genuinely irreversible external actions
(a real cloud deploy) to a Human Review list.

## Direction update — LOCKED 2026-07-06 (HIGHEST PRIORITY — supersedes any conflict below)

Apply ALL of these; they override the original locked decisions where they conflict:

1. **RTX-realistic look** (not flat/cozy voxel): PBR materials, glossy reflections (env map + SSR where
   feasible), soft shadows, volumetric god-rays, emissive glow, bloom, subtle DoF — the "Minecraft RTX"
   aesthetic. **Warm golden-hour palette. No purple.**
2. **Cut the narrator** — remove the companion-critter dialogue/subtitle overlay entirely. World + light +
   sound carry it. Any critter that remains is silent, subtle, text-free.
3. **Bespoke island per project** (hard req — not reskins): unique silhouette + materials + accent per
   project (Meridian = control-tower/power-grid; TARK = courthouse/library; Cab = transit hub w/ rails;
   Windflow = AI forge/lab; Achievements = trophy hall).
4. **Minecraft-style start menu**: KALPANA blocky logo + stone/dirt-textured beveled buttons (hover +
   click-depress) to pick a realm (Explore/Projects/Experience/Achievements/About). This first click also
   unlocks audio.
5. **Sound effects** — Minecraft-flavored (clicks, footsteps/ticks, whooshes, chimes). **Original /
   royalty-free / CC0 ONLY — never ripped Minecraft or C418 assets.**
6. **Music** — calm ambient loop (original or CC0, C418-*style* not C418), starts on first click, with a
   **mute/volume** toggle. Gesture-gated for autoplay policy.
7. **Build handling:** redirect from the existing scaffolding — don't wipe; pivot lighting/materials, cut
   the narrator, add the start menu + audio, and rebuild each island bespoke.

## Locked decisions (NO decision intake — build straight through)

All choices are already made. Do not ask; just build. (Human may override name/palette in one message
before kickoff; otherwise these hold.)

- **Format:** 3D-interactive **voxel** world (Minecraft-style), toured via **click-to-travel + a guided
  auto-tour** — **no free-roam character controller.** Camera-directed (GSAP fly-ins + holds).
- **Host:** a **companion critter** (working name **Kip**) — a small glowing voxel creature that leads
  the tour, reacts, and speaks in Priyadeep's warm, funny voice.
- **Palette / vibe:** **golden-hour warm** (cozy + cosmic), fun + creative. UI bar = **out-of-this-world
  showpiece.**
- **Project demos:** **showcase only** — beautiful in-world screens + links (live URL / GitHub). No live
  embeds.
- **Content:** seed from `../../main.tex` now; consume the APEX `feed.json` later (JSON Resume +
  extensions per `../../SHARED-INTERFACES.md` §1).
- **Deploy:** **Vercel — auto-deploy at Definition of Done via `vercel --prod --yes`** (non-interactive;
  uses the logged-in CLI; if Vercel isn't authed, queue the deploy to Human Review instead of failing).
  **Model:** Fable 5 high→max; on Fable limit → fall back to **Opus 4.8** and continue.

## The world (from the ideation doc — build all of it)

- **Hub:** spawn → pick a realm (Projects · Experience · Achievements · About) OR a "take the tour ↓"
  prompt starts the guided wander, critter leading.
- **Projects → archipelago:** each project = an island with a **hero structure** (signature landmark) +
  a **creature** + **showcase panels** (Meridian = map-observatory + map-fox; TARK = library/courthouse +
  owl-scribe; Campus Cab = rail-station + cart-critter; + any other real projects).
- **Experience → village of professions:** **Windflow** (AI-smith at a redstone/enchant bench), **IIT
  Patna** (Librarian/scholar at a lectern), **Extracurriculars** (TEDx orator + Yavanika dramatics bard +
  NSS helper).
- **Achievements → Hall of Statues:** pedestals, medals, glowing trophies — Amazon ML Summer School, JEE
  ranks, Inter-IIT Bronze.
- **About / Contact → cozy home base** (house, mailbox, social signs).

## Non-negotiables (v1's hard-won lessons)

- A **fast, accessible SSR text core** under the world — every résumé section as real crawlable HTML
  (recruiters on slow phones + SEO always get everything).
- **Perf:** instanced cubes + greedy meshing; **render one realm at a time** (load on demand); perf tiers
  + `prefers-reduced-motion` static fallback.
- **Hero structures are the "generational" make-or-break** — build a strong voxel kit + a few genuine
  showpiece landmarks; this is where craft goes.
- **Companion-critter charm** carries the personality — idle animations, reactions, in-voice one-liners.

## Tech stack

Next.js (SSR/SEO core) + React Three Fiber / Three.js voxel; instanced cubes + greedy meshing;
GSAP-driven cinematic camera tour (no character physics); warm custom lighting + painterly sky shader;
procedural + hand-placed voxel structures (MagicaVoxel→glTF optional); showcase panels; content from
`../../main.tex` (JSON Resume shape) → APEX feed later; Vercel.

## Autonomy protocol (follow exactly — one-shot, no interruptions)

Everything is pre-decided above → **run start-to-finish without asking.** Self-decide any detail via
doctrine (follow this prompt + the ideation doc; prefer reversible, tasteful defaults; log every call to
`BUILD_STATE.md` + graphify). **Deploy automatically** at Definition of Done with `vercel --prod --yes`
(non-interactive; uses the logged-in CLI) and record the live URL in `BUILD_STATE.md`; if Vercel isn't
authed, queue the deploy to **Human Review** instead of failing. Only buying a custom domain stays Human
Review — never halt the build for it. Maintain `BUILD_STATE.md`
every milestone. Context hot → ponytail compress + flush to graphify + compact; if full, checkpoint +
resume in a fresh session that rehydrates from graphify + `BUILD_STATE.md`. Near the 5h limit → checkpoint;
the scheduled task resumes. Use subagents (Explore / Plan / a verification agent). Stop only at Definition
of Done.

## Milestones (each must hit its acceptance)

- **P1** — SSR content core + the **Hub** + ONE gorgeous project island (hero build + creature + showcase
  panel) + the **companion critter** + click-to-enter + guided-tour skeleton + warm sky.
  *Done:* deploys; that island + critter genuinely charm in real Chrome.
- **P2** — Full **Projects archipelago**: every project island + hero structure + creature + showcase.
- **P3** — **Experience village** (3 profession-villagers) + **Achievements Hall of Statues** +
  About/Contact home base.
- **P4** — Guided-tour polish + critter personality (dialogue, idle, reactions) + easter eggs + day/night
  + sound/particles.
- **P5** — APEX feed integration + mobile/perf tiers + accessibility pass + the "wow" finish.

## Definition of Done

All phases meet acceptance; the full world tours smoothly on desktop + mobile; SSR core crawlable;
**auto-deployed to Vercel (`vercel --prod --yes`), live URL recorded in `BUILD_STATE.md`**; README. Then
stop and report.

## Kickoff

No questions — everything is locked above. Initialize the repo in this folder, create `BUILD_STATE.md`,
and begin P1. Report only at milestone completions, at the Human Review queue, or at Definition of Done.
