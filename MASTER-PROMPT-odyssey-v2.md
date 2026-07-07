# KALPANA (odyssey-v2) — Master Build Prompt (one-shot · whole-scope · autonomous)

*Paste into the odyssey-v2 build session (Fable 5, effort high→max; on Fable limit → fall back to Opus 4.8
and continue). Scope source of truth: `ideation-odyssey-v2.md` in this folder. Full execution rules:
`../00-BUILD-PLAN.md`. This is the **RTX rebuild** — REDIRECT the existing scaffolding, do not wipe it.*

---

## FINAL ADDENDUM — locked 2026-07-07 (HIGHEST PRIORITY — supersedes any conflict below)

*Post-audit resolutions + owner decisions. If anything below the addendum conflicts with it, the addendum wins.*

### Owner decisions (locked)
- **Audience = everyone.** Build the recruiter fast lane so skeptics lose nothing AND keep the full
  spectacle. Neither is sacrificed.
- **Recruiter fast lane = FULL (required, not optional):**
  - A **persistent global HUD**, present on the main menu AND inside every realm, Monocraft-styled to fit,
    with: **Résumé (PDF) · Projects · Experience · Achievements · GitHub · LinkedIn · Contact · Classic
    view**. Always reachable; never requires taking the tour.
  - A **downloadable, ATS-clean PDF résumé** with a prominent button on the menu + in the HUD. (Generate it
    from `../main.tex` content — ship an actual `/resume.pdf`.)
  - A **Classic view** at a stable route (`/classic`, linked as "In a hurry? View résumé →"): a fast,
    scannable HTML page — bio, one-line "what I do", a literal **skills index** (scannable keyword strings),
    every project (screenshots + links), experience, achievements, résumé download, and all social/contact
    links. This is the SSR text core, surfaced as a first-class destination (not just a crawler fallback).
  - **Entry model:** a single **"Enter" gate** (also unlocks audio) that shows a **one-screen summary
    overlay** during load — name, one-line what-I-do, top-3 skills, top-3 projects, and Résumé/GitHub/
    Contact buttons — with **"Enter world"** and **"View résumé"** side by side. Never trap the user in a
    loader with no exit.
- **Project depth in-world = screenshots + links** (owner's call — keep in-world panels light). Each panel:
  title, one-line what-it-is, screenshot/placeholder, **live + GitHub links**, and a one-line **stack**
  string (cheap, and doubles as keywords). Deeper detail lives in Classic view. *(If real product
  screenshots aren't available, use tasteful stylized placeholder panels — do not stall.)*
- **Deploy = preview first, human-approves prod.** Auto-deploy to a **Vercel PREVIEW** URL at each
  milestone and at Definition of Done; record the preview URL in `BUILD_STATE.md`. **Do NOT run
  `vercel --prod`** — queue "promote to production" to **Human Review**. (This overrides the auto-`--prod`
  language later in this doc.)
- **Branding:** site title/logo = **PRIYADEEP JAISWAL**; "Kalpana" is codename-only, never on screen.

### Content source (do this first, before modeling)
Parse **`../main.tex`** (his real résumé) into a single **`content.json`** (projects, roles, achievements,
skills, bio, links) and build the whole site from that one file — do NOT hardcode content in components.
If a field is missing (social URLs, contact email, project links, screenshots), leave a clearly-marked
`TODO` placeholder and add it to a **`CONTENT-TODO.md`** for the owner — never invent real links/emails.
Contact = a simple **`mailto:`** (no serverless form). Deep-link realms/projects (`/projects/meridian`,
`/experience`, `/achievements`, `/classic`) for shareability.

### Technical must-dos (resolve the audit's risks — mandatory)
- **3D sign/label text:** render with **`troika-three-text`** (SDF) or drei `<Text>` — crisp at distance/
  angle. Do NOT bake blurry texture text. Every label also exists in the DOM/Classic view for a11y.
- **Greedy meshing has a fallback:** if greedy-meshed chunks + atlas aren't solid quickly, ship
  **`InstancedMesh` per block-type** instead and move on — do not burn the schedule perfecting the mesher.
  Guard against **atlas texture bleeding** (padding/gutters, correct mip handling).
- **`frameloop="demand"` reconciliation:** any continuous animation (water reflector, god-rays, pulsing
  emissives, moving carts, particles) must call **`invalidate()` per frame** (or run the loop while a realm
  has live animation). Verify carts/water don't freeze when the camera holds.
- **WebGL context-loss handler:** listen for `webglcontextlost`/`restored`, prevent default, dispose render
  targets on realm switch, and show a "reload" fallback — never a silent white canvas.
- **SSR + R3F hydration:** the `<Canvas>` and anything touching `window`/`useDetectGPU` must be a
  **client-only** dynamic import (`ssr:false`) or mounted in `useEffect` — the Classic/SSR text must render
  server-side with no hydration mismatch.
- **Fonts:** Monocraft for UI/menu/signs/headings with `font-display:swap` + preload. **Body/résumé prose
  (Classic view, panels) uses a readable system/sans font**, NOT Monocraft — legibility over theme for long
  text.
- **Performance floor (concrete):** tier-2 (M2 Air) target **≥45fps, never below 30** — auto-drop effects
  (DoF → god-rays → SSR-reflector → soft-shadow quality, in that order) to hold it. 60fps is the goal, not a
  gate; the floor is the gate.
- **SEO/discovery:** meta description, **OG + Twitter card images**, `sitemap.xml`, `robots.txt`, canonical
  URLs, JSON-LD Person. Add **Vercel Analytics** (or Plausible) — lightweight.
- **States:** explicit loading (per-realm), `prefers-reduced-motion` → Classic view, WebGL-unsupported →
  Classic view, asset-load-failure fallback.
- **CREDITS/LICENSES.md** listing every asset + license (all original/CC0/OFL).

### Scope for the autonomous run (bounds the "generational" bar)
Guaranteed Definition of Done = **P0 + P1 (perfected Meridian island) + the full fast lane (HUD, PDF,
Classic view, skills index) + deploy to preview.** P2–P5 are attempted in order if budget remains but are
**stretch**, not required — a shipped, fast, recruiter-usable site with one jaw-dropping island beats five
rushed ones. Log where you stop in `BUILD_STATE.md`.

---

## Mission

Build **Priyadeep Jaiswal's portfolio** — a generational-quality **voxel portfolio world** you tour, lit
like **"Minecraft with RTX on" at golden hour**. ("Kalpana" is the internal build codename ONLY — the site
brands with Priyadeep's name, never "Kalpana".) Land on a **Minecraft-style main menu**, pick a realm, and the camera flies
through a sunlit cosmos of **bespoke, labeled landmarks**. Bar: **Awwwards Site-of-the-Year.** Own the whole
assignment; run start-to-finish without stopping for the human except to queue genuinely irreversible
external actions (a real cloud deploy) to a Human Review list.

## HARD CHANGES vs. the previous build (highest priority — these override everything)

1. **DELETE the narrator/host/companion-critter entirely.** No tour-guide creature, no dialogue, no
   subtitle overlay, no "in-your-voice" one-liners — remove the dialogue/subtitle system from the code.
   Ambient creatures may exist as silent, text-free set-dressing only. **The world + light + sound carry
   it.**
2. **RTX-realistic golden-hour look**, not flat/cozy. Implement the render recipe below (PBR, env-map
   reflections, N8AO, bloom, god-rays, ACES, soft shadows). **Warm sunlit palette — no purple.**
3. **Font = Monocraft (OFL) everywhere** — menu, in-world signs, HUD, headings. Remove the old fonts.
   (Silkscreen/Pixelify Sans, OFL, allowed for tiny labels only.) **Do not use "Minecraftia."**
4. **Minecraft-style main menu** = the landing screen: the site title is **PRIYADEEP JAISWAL** (the
   portfolio owner's name) as the blocky/pixel logo — **NOT "Kalpana"** (that's only the internal build
   codename and must never appear on screen). A tasteful blocky tagline under it is fine
   (e.g. "Portfolio" / "ECE · IIT Patna"). Rendered over a dimmed dirt/stone panel with a slow golden-hour
   vista behind; **stone/dirt-textured beveled buttons** (light top-left/dark
   bottom-right bevel, hover-highlight, click-depress) for realms **Explore · Projects · Experience ·
   Achievements · About**. First click **unlocks audio**.
5. **Every structure is LABELED** with an in-world Monocraft **sign** (island names, building names,
   villager trades). Non-negotiable — for readability + accessibility.
6. **Each project island is a BESPOKE build** matched to the project (unique silhouette/materials/accent) —
   not reskinned copies. Meridian = control-tower over a glowing power-grid; TARK = courthouse/library;
   Campus Cab = transit hub with rails+carts; each other real project → its own landmark.
7. **Experience = each role is its OWN trade** with its OWN building, workstation, villager, and sign.
   **Split the extracurriculars into separate buildings:** **TEDx** (orator on a speaking-stage),
   **Yavanika** (bard at a theatre), **NSS** (volunteer at a community post) — plus **Windflow** (AI-smith
   at a forge) and **IIT Patna** (scholar at a lectern). Never one lumped "extracurriculars" hut.
8. **Achievements = a redone Monument Hall:** warm beacon beams + engraved stone plinths + emissive medals
   that bloom + Monocraft nameplates + reflective floor. NOT floating cartoon trophies.

## Asset licensing — MANDATORY (public, recruiter-facing site)

Emulate the Minecraft *feel* with **original or open-licensed assets only**. **Never** use Mojang's or
C418's actual files, the "Minecraft" name as branding, or their named characters.

- **Font:** **Monocraft** (OFL 1.1). Self-host the OFL font file; ship its license.
- **Textures:** hand-authored 16×16 pixel textures (nearest-neighbor, ≤4 shades, seamless tiling) and/or
  **CC0** packs — **ambientCG**, **Poly Haven**, **Kenney** (all CC0, no attribution). Build a texture
  atlas for chunk meshing.
- **Characters/creatures:** **original** blocky designs (Blockbench/MagicaVoxel) with distinct silhouettes,
  our palette, our faces. **Never** Steve/Alex/Creeper/Enderman/Zombie/Villager. (Kenney "Blocky
  Characters", CC0, may be modified as a base.)
- **Music:** one calm ambient/piano loop from **Pixabay Music** (commercial-OK, no attribution) or
  **OpenGameArt CC0** (e.g. "Exploration Theme", "Ambient Relaxing Loop"). **Never a C418 track.** Gesture-
  gated start on first click; visible **mute/volume** toggle.
- **SFX:** **Kenney** Interface/UI/Impact audio (CC0) + **Freesound** filtered to **CC0** — button
  click/press, footstep ticks, block-place, soft chimes, whooshes.
- Keep a short **CREDITS/LICENSES** note in the repo listing every asset + license. If any CC-BY asset is
  used, add on-page attribution; prefer CC0/Pixabay to avoid it.

## RTX render recipe (implement this stack)

**Realism dial = MAX.** Push photoreal "Minecraft RTX" as far as the hardware allows: crisp env-map +
planar reflections, strong contact-hardening soft shadows, volumetric god-rays, HDR emissive bloom, ACES
film response, warm golden-hour grade. Author real PBR block textures (albedo + roughness + normal, and
emissive where it glows). On tier-3 desktop go full-quality; on the M2 Air hold 60fps at tier-2 without
visibly dropping the look; only strip effects on mobile/weak GPUs.

- **Renderer:** `toneMapping = NoToneMapping` (tone-map as the last post effect); `dpr={[1,1.5]}`;
  `frameloop="demand"` (invalidate on camera/scene change).
- **Materials:** `MeshStandardMaterial` for ~all blocks — roughness **0.3–0.45** for glossy/"wet RTX"
  blocks, 0.7–0.9 matte for dirt/stone/wood. `MeshPhysicalMaterial` only for ice/glass/water
  (transmission, ior 1.33–1.5). Emissive blocks: `emissiveIntensity` 2–4 + **`toneMapped={false}`** so
  they bloom. Textures: `NearestFilter`, sRGB on albedo only, anisotropy capped at 4 on mobile.
- **Reflections (do NOT attempt real SSR — removed from the pmndrs stack):** golden-hour **HDRI via drei
  `<Environment>`** (PMREM, 1k mobile / 2k desktop) sets `scene.environment` for env reflections on every
  block; **`<MeshReflectorMaterial>`** on water/polished floors for planar mirroring.
- **Post (`<EffectComposer enableNormalPass frameBufferType={HalfFloatType}>`), in order:**
  **N8AO** (`n8ao`, aoRadius ~2, intensity 3–5, blue-tinted color for GI, halfRes on the Air) → **Bloom**
  (`mipmapBlur`, luminanceThreshold ~0.9, intensity 0.6–1.2) → **GodRays** (from a small emissive sun mesh
  at the sun position, 30–60 samples) → **DepthOfField** (subtle, desktop only) → **ToneMapping**
  `ACES_FILMIC` (try `AGX` too) → warm grade (`LUT` golden-hour `.cube`, or `HueSaturation` + `Vignette`) →
  **SMAA** last.
- **Shadows:** drei `<SoftShadows>` (PCSS, mount once — never toggle per-frame) + `<CSM>` cascaded shadow
  maps (3–4 cascades, 2048 desktop/1024 mobile) for the big sun; `<ContactShadows>` mobile fallback.
- **Lighting:** low warm `directionalLight` sun (`#ffd9a0`–`#ffb56b`, intensity ~3, long shadows) + cool
  `hemisphereLight` fill + drei `<Sky>` tuned to sunset (low elevation, turbidity 8–10) + warm `fogExp2`.
- **Perf:** **greedy-meshed chunks + texture atlas** (≤~100 draw calls), `InstancedMesh`/`<Instances>` for
  repeated props, `BatchedMesh` where useful; drei `useDetectGPU()` tiers — **tier ≤1 (mobile/weak):** SMAA
  + ContactShadows + env-map only, no god-rays/DoF/SoftShadows; **tier 2 (M2 Air):** full stack, halfRes
  N8AO, god-rays 30, dpr 1.25; **tier 3:** everything maxed. `AdaptiveDpr` + `PerformanceMonitor` to
  auto-throttle. `prefers-reduced-motion` → static SSR fallback.

Install: `three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing n8ao`.

## The world (build all of it — per `ideation-odyssey-v2.md`)

- **Main menu → realms:** Explore (guided tour) · Projects · Experience · Achievements · About. One realm
  in memory at a time (load on demand). Cinematic click-to-travel + guided auto-tour; **no free-roam
  character.**
- **Projects archipelago:** bespoke labeled islands — Meridian (control-tower + glowing power-grid), TARK
  (courthouse/library), Campus Cab (rail transit hub), + any real project from `../main.tex`/APEX feed →
  its own landmark + sign. Showcase panels = screenshots + live/GitHub links (no live embeds).
- **Experience village:** separate labeled buildings — **Windflow** (AI-smith/forge), **IIT Patna**
  (scholar/lectern), **TEDx** (orator/stage), **Yavanika** (bard/theatre), **NSS** (volunteer/post). Each a
  distinct silhouette + workstation + original villager + sign.
- **Achievements Monument Hall:** beacon beams + engraved plinths + blooming emissive medals + reflective
  floor + Monocraft nameplates — Amazon ML Summer School, JEE ranks, Inter-IIT Bronze, + others.
- **About/Contact home base:** cozy golden-hour house, mailbox, hanging social/link signs. Labeled.

## Non-negotiables (v1's hard-won lessons)

- Fast, accessible **SSR text core** under the world — every résumé section as real crawlable HTML +
  JSON-LD; recruiters on slow phones + SEO always get everything.
- **Every structure labeled** with a Monocraft in-world sign.
- **Render one realm at a time**; perf tiers + reduced-motion static fallback.
- Hero structures (Meridian tower, courthouse, Monument Hall) are the generational make-or-break — put the
  craft there.

## Content

Seed from `../main.tex` (JSON-Resume shape) now; consume the APEX `feed.json` later (per
`../SHARED-INTERFACES.md` §1) — a new project in the feed = a new bespoke island + sign + showcase, ideally
data-driven.

## Autonomy protocol (one-shot, no interruptions)

Everything is pre-decided above → **run start-to-finish without asking.** Self-decide any detail via
doctrine (this prompt + the ideation doc; prefer reversible, tasteful defaults; log every call to
`BUILD_STATE.md` + graphify). Context hot → ponytail compress + flush to graphify + compact; if full,
checkpoint + resume in a fresh session that rehydrates from graphify + `BUILD_STATE.md`. Near the 5h limit →
checkpoint. Use subagents (Explore / Plan / a verification agent that screenshots the world in real Chrome
and checks: no narrator anywhere, Monocraft loaded, god-rays/bloom visible, every structure signed, each
extracurricular its own building). **Deploy automatically** at Definition of Done with `vercel --prod --yes`
(non-interactive, logged-in CLI); if Vercel isn't authed, queue the deploy to **Human Review** instead of
failing. Stop only at Definition of Done.

## Milestones (each must hit acceptance)

- **P0 — Redirect + foundation.** Keep the repo; **remove the narrator/dialogue/subtitle system**; swap in
  Monocraft; stand up the RTX lighting/material/post pipeline + the Minecraft main menu + gesture-gated
  audio (music loop + SFX). *Done:* menu → click → warm RTX world with god-rays/bloom, music starts, **no
  narrator anywhere in code or UI.**
- **P1 — Meridian, perfected.** SSR core + the bespoke Meridian island (control-tower + power-grid + sign +
  showcase) fully RTX-lit. *Done:* deploys; Meridian jaw-drops in real Chrome.
- **P2 — Projects archipelago.** Every project island bespoke + labeled + showcase panels.
- **P3 — Experience village + Monument Hall + About.** Every trade its own building/villager/sign
  (extracurriculars split into TEDx/Yavanika/NSS); the redone achievements hall; the home base.
- **P4 — Cinematic + audio polish.** Guided-tour timing, SFX mapping, golden-hour ambience, particles,
  easter eggs, mobile/perf tiers, accessibility (labels/reduced-motion) pass.
- **P5 — APEX feed integration + the "wow" finish + deploy.**

## Definition of Done

All phases meet acceptance; the full world tours smoothly desktop + mobile; **no narrator/critter dialogue
exists**; Monocraft everywhere; every structure signed; each extracurricular its own building; Monument Hall
redone; SSR core crawlable; all assets original/CC0/OFL with a CREDITS file; auto-deployed to Vercel with
the live URL recorded in `BUILD_STATE.md`; README written. Then stop and report.

## Kickoff

No questions — everything is locked above. Read `ideation-odyssey-v2.md` + this prompt + `BUILD_STATE.md`
(and graphify) to resume exactly where the scaffolding is, then execute **P0** first (rip out the narrator,
apply the RTX pipeline + Monocraft + main menu + audio) and continue through P5. Report only at milestone
completions, at the Human Review queue, or at Definition of Done.
