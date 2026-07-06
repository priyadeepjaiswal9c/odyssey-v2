# odyssey-v2 — Ideation Notes (LOCKED)

*Captured: 2026-07-04 · Mode: ALL IN, generational / Awwwards Site-of-the-Year bar · Working name: **Kalpana** ("imagination")*

> A cozy **voxel world** you *tour* — floating Minecraft-style islands in a warm, dreamy sky, led by a
> cute **companion critter** who shows you around. Project-islands with signature hero builds, a little
> village of profession-villagers, and a grand hall of achievement statues. You click to travel (or take
> the guided tour), meet the cast, and leave grinning: *"this guy is fun."* The 3D-interactive soul of
> v1, with a whole new heart.

---

## Direction update — LOCKED 2026-07-06 (overrides anything below it conflicts with)

- **Look = RTX-realistic, not flat/cozy.** Keep the voxel blocks, but light them like **Minecraft with
  RTX on**: PBR materials, glossy reflections (env map / SSR), soft ray-traced-style shadows, volumetric
  god-rays, emissive glow, bloom, subtle depth-of-field. Premium and dramatic.
- **Palette = warm golden-hour. No purple anywhere.** Sunlit, warm reflections, long soft shadows.
- **Narrator = CUT.** No companion-critter dialogue or subtitle overlay (it read cheesy). World +
  lighting + sound carry it. Kip, if kept at all, is silent and subtle — zero text.
- **Each island = a bespoke build, styled to its project's type** (hard requirement — not reskinned
  copies). Distinct silhouette, materials, accent per project: Meridian (energy supply-chain) → a
  control-tower over a glowing power-grid; TARK (legal AI) → a courthouse / great-library; Campus Cab →
  a transit hub with rails + carts; Windflow (AI intern) → an AI forge/lab; Achievements → a trophy /
  monument hall.
- **Start menu = Minecraft main-menu style.** Landing screen: the **KALPANA** title as a blocky/pixel
  logo + **Minecraft-styled buttons** (stone/dirt-textured, 3D bevel, hover-highlight, click-depress) to
  choose a realm — Explore · Projects · Experience · Achievements · About. This first click also unlocks
  audio (satisfies browser autoplay policy).
- **Sound effects** — Minecraft-*flavored* SFX: button click/press, footstep/block ticks on interaction,
  whoosh on camera fly-ins, soft chimes on reveals. **Original / royalty-free / CC0 only — never ripped
  Minecraft or C418 assets** (copyright).
- **Music** — a calm ambient background loop (original or CC0, C418-*style* but not C418's tracks), starts
  on the first button click, with a visible **mute / volume** toggle.
- **Build handling:** **redirect from the current scaffolding** (don't full-wipe) — pivot lighting/
  materials to RTX golden-hour, cut the narrator, add the start menu + audio, and rebuild each island as
  its own bespoke structure.

## Locked decisions (front-loaded → the build runs with zero interruptions)

- **Navigation:** **click-to-travel + a guided auto-tour** — no free-roam character. A camera-directed
  cinematic voxel diorama. (Naturally mobile-friendly, and easier to make *beautiful*.)
- **Host/avatar:** a **companion critter** — a small glowing voxel creature (working name **Kip**) who
  flies ahead, points things out, reacts, and talks in your voice. The thread of charm.
- **Project demos:** **showcase only** — gorgeous in-world screens + links (live URL / GitHub). No live
  embeds. Light, fast, reliable.
- **Experience village:** three villagers — **Windflow** (AI-smith), **IIT Patna** (Librarian/scholar),
  **Extracurriculars** (TEDx / Yavanika dramatics / NSS).
- **Aesthetic:** Minecraft voxel · **golden-hour warm** palette (cozy + cosmic) · fun + creative energy.
- **Overridable in one line before kickoff:** the name (Kalpana / Kip), the palette. Otherwise these are
  locked and it builds straight through.

## The world map — a hub with realms

You **spawn on a central hub**. You either **pick a realm** (portals/signs: Projects · Experience ·
Achievements · About) *or*, if you don't choose, a **"take the tour ↓" prompt** starts a guided wander,
the critter leading. Click-to-travel between everything; the camera flies you in cinematically.

- **Projects → an archipelago.** Each project = an island with a **hero structure** (signature landmark)
  + its **creature** + **showcase panels** (screens + live/GitHub links):
  - *Meridian* → a map-observatory tower · a map-fox · glowing redstone supply-lines.
  - *TARK* → a great voxel library/courthouse · an owl-scribe · contract scrolls.
  - *Campus Cab* → a rail-station · a cart-critter on tracks.
  - (+ any other real projects from `../main.tex` / the APEX feed.)
- **Experience → a village of professions.** Each role = a **villager with a Minecraft job** at a
  workstation: **Windflow** = an "AI-smith" at a redstone/enchant bench; **IIT Patna** = a Librarian at a
  lectern; **Extracurriculars** = a few colorful villagers (a TEDx "orator," a dramatics "bard," an NSS
  "helper"). Each shares its story in your voice.
- **Achievements → a Hall of Statues.** A grand hall of pedestals, medals, and glowing trophies — Amazon
  ML Summer School, JEE ranks, the Inter-IIT Bronze — a literal winning-showcase.
- **About / Contact → a cozy home base.** A little house, a mailbox, social signs.

## What's very possible

All of it — voxel is *made* for hero builds, villagers, statues, hub-and-realms, day/night, easter eggs,
cinematic camera tours, and data-driven generation from your résumé. Click-to-travel removes the hardest
part (character physics) and is a gift for mobile.

## Watch-outs (design decisions, already resolved)

- **Hero structures are where the "generational" bar lives** → budget the craft there: a strong voxel
  building-block kit + a few showpiece landmarks. This is the make-or-break for "wow."
- **Keep a fast SSR text core** under the game (all résumé data as real HTML) → recruiters on slow phones
  + Google never lose out. Non-negotiable, carried from v1's lessons.
- **Render one realm at a time** (load-on-demand) for buttery perf.
- **Companion-critter charm** carries the personality — invest in its idle animations, reactions, and
  in-your-voice one-liners.

## Tech (buildable, award-oriented)

Next.js (SSR/SEO core) + React Three Fiber / Three.js voxel; **instanced cubes + greedy meshing**;
**camera-directed tour** (GSAP timelines for fly-ins + holds — no character controller); warm custom
lighting + painterly sky; procedural + hand-placed voxel structures (MagicaVoxel→glTF optional);
showcase panels (screens + links); perf tiers + reduced-motion; data from `../main.tex` now, APEX feed
later; **Vercel** deploy.

## Phased build (each ships something charming)

- **P1** — SSR content core + the **Hub** + ONE gorgeous project island (hero build + creature + showcase
  panel) + the **companion critter** + click-to-enter + guided-tour skeleton + warm sky.
  *Done:* deploys, and that one island + critter genuinely charm.
- **P2** — Full **Projects archipelago**: every project island + hero structure + creature + showcase.
- **P3** — **Experience village** (3 profession-villagers) + **Achievements Hall of Statues** +
  About/Contact home base.
- **P4** — Guided-tour polish + critter personality (dialogue, idle, reactions) + easter eggs + day/night
  + sound/particles.
- **P5** — APEX feed integration (data-driven) + mobile/perf tiers + accessibility pass + the "wow"
  finish. Deploy.

## Verdict

This is the one. Click-to-travel + a companion critter makes it **charming, buildable, and mobile-safe**;
hero-structure islands + a profession-village + a statue hall give it **soul and showcase**; voxel makes
**fun + creative** the default; and the whole thing clears the **generational** bar without the perf risk
of free-roam 3D. A cozy little cosmos with a cast you meet — and you leave grinning.
