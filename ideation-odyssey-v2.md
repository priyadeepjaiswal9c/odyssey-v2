# Priyadeep Jaiswal — Portfolio (voxel/RTX rebuild, 2026-07-07)

*Internal build codename: "Kalpana" (folder/repo only — **never shown on the site**). The site brands with
**Priyadeep Jaiswal's** name. Bar: Awwwards Site-of-the-Year. This file fully replaces the earlier ideation
— a clean re-think of the concept, look, fonts, naming, and every realm. The odyssey-v2 build session
treats THIS as the source of truth (with `MASTER-PROMPT-odyssey-v2.md`).*

> A blocky voxel world you tour — but lit like **"Minecraft with RTX on"** at **golden hour**. You land on
> a **Minecraft-style main menu**, pick a realm, and the camera flies you through a small sunlit cosmos of
> hand-built landmarks: a project archipelago, a working village where each role is its own trade, and a
> monument hall of achievements. Every structure is **labeled with an in-world sign** so you always know
> what you're looking at. **No narrator, no talking critter, no subtitles** — the light, the builds, and
> the sound do all the talking.

---

## What was wrong with the last build (and is now fixed)

1. **The "host/critter/narrator" is gone.** No companion creature leading the tour, no dialogue, no
   subtitle overlay. That's the "keep thing" that kept reappearing — it's deleted at the concept level, not
   just hidden.
2. **Flat/cozy look → RTX-realistic golden hour.** PBR blocks, glossy env-map reflections, soft shadows,
   volumetric god-rays, bloom, ACES film tone-mapping. Warm sunlit palette. No purple.
3. **Ugly fonts → one authentic pixel font: Monocraft.** A free, open-licensed (OFL) Minecraft-style
   typeface used everywhere (menu, signs, HUD). No mismatched font soup.
4. **"A bunch of occupations in one" → every extracurricular is its own trade.** TEDx, Yavanika dramatics,
   and NSS each get their **own villager, own building, own workstation, own sign** — not one lumped
   "extracurriculars" hut.
5. **Bad trophies → a proper monument hall.** Beacon-lit stone plinths, engraved nameplates, emissive
   medals that bloom — a real hall of honor, not floating clip-art cups.
6. **Nothing was labeled → every structure has a sign.** Hanging/standing voxel signs in Monocraft name
   each island, building, and villager so the world reads instantly.

---

## The look — authentic Minecraft, done legally (READ THIS)

We make it **feel unmistakably like Minecraft** while shipping a **public, recruiter-facing** site. So we
emulate the *style* with **original + open-licensed (CC0/OFL)** assets, and never ship Mojang's or C418's
actual files. The style (cubes, texel textures, pixel UI, warm light) is fair game; the specific files are
not. This protects the site from takedowns and still looks the part.

**Legally clean asset stack (all verified free for public/commercial use):**

- **Font:** **Monocraft** — OFL 1.1, directly inspired by the Minecraft typeface, contains no Mojang
  assets. Primary font for menu, signs, HUD, headings. (Pair with **Silkscreen**/**Pixelify Sans**, OFL,
  for tiny labels only if needed.) *Do NOT use "Minecraftia"* — its free tier bars commercial use.
- **Block textures:** hand-authored 16×16 pixel textures (100% ours) and/or CC0 packs — **ambientCG**,
  **Poly Haven** (both CC0, no attribution), **Kenney** voxel/texture packs (CC0). Nearest-neighbor
  filtering, ≤4 shades per block, hand dither, seamless tiling.
- **Characters (villagers/creatures):** **original** blocky mascots built in **Blockbench**/**MagicaVoxel**
  — distinct silhouettes, our own palette and faces. **Never** Steve, Alex, Creeper, Enderman, Zombie, or
  the Villager profile. (Kenney "Blocky Characters", CC0, may be used as a base to modify.)
- **Music:** calm ambient/piano loop in the cozy-exploration mood — from **Pixabay Music** (Pixabay
  license, commercial-OK, no attribution) or **OpenGameArt CC0** (e.g. "Exploration Theme",
  "Ambient Relaxing Loop", "CC0 Calm/Relaxing Music"). **Never a C418 track.** Starts on first click;
  visible mute/volume.
- **SFX:** UI click/press, footstep ticks, block-place, soft chimes/whoosh — **Kenney** Interface/UI/Impact
  audio packs (CC0) + **Freesound** filtered to **CC0**. No ripped Mojang sounds.
- **Naming/branding:** the site brands with **"Priyadeep Jaiswal"** (his portfolio); "Kalpana" is the
  internal build codename only and must never appear on screen. Describe the style as *voxel /
  blocky-sandbox* — we do **not** brand it "Minecraft" anywhere (that's a trademark).

**One-line policy for the build:** *emulate the feel with assets we made or that are OFL/CC0/Pixabay/CC-BY;
never use Mojang's name, characters, textures, sounds, or C418's music.*

---

## The RTX render recipe (how we fake ray-tracing in the browser)

Target: 60fps on an 8GB MacBook Air M2, graceful mobile fallback. R3F + Three.js.

- **Materials:** `MeshStandardMaterial` for ~all blocks (roughness **0.3–0.45** on the "polished/glossy"
  blocks = the wet RTX sheen; 0.7–0.9 matte for dirt/stone/wood). `MeshPhysicalMaterial` only for
  ice/glass/water (transmission, ior). Emissive blocks (glowstone/lava) use `emissiveIntensity > 1` +
  `toneMapped={false}` so they actually bloom.
- **Reflections (no real SSR — it's dead in the R3F stack):** a **golden-hour HDRI via drei
  `<Environment>`** (PMREM) drives sharp env reflections on every block; **`<MeshReflectorMaterial>`** on
  water/polished floors for real planar mirroring. Env-gloss + one reflector + bloom + AO reads as "ray
  traced" to nearly everyone.
- **Post stack** (`<EffectComposer enableNormalPass frameBufferType=HalfFloat>`, renderer
  `toneMapping=NoToneMapping`), in order: **N8AO** (ambient occlusion, blue-tinted for GI feel) → **Bloom**
  (mipmapBlur, threshold ~0.9) → **GodRays** (from a sun mesh, 30–60 samples) → subtle **DoF** (desktop) →
  **ACES Filmic ToneMapping** (or AgX) → **warm golden-hour LUT / HueSaturation + Vignette** → **SMAA**
  last.
- **Shadows:** drei `<SoftShadows>` (PCSS) + `<CSM>` cascaded shadow maps for the big sunlit world;
  `<ContactShadows>` as the mobile fallback.
- **Lighting rig:** low warm directional **sun** (`#ffd9a0`, long shadows) + cool hemisphere fill +
  drei `<Sky>` tuned to sunset + warm `fogExp2` for depth (also hides chunk pop-in).
- **Performance:** **greedy-meshed chunks + texture atlas** (≤~100 draw calls), instancing for repeated
  props, `frameloop="demand"`, `dpr={[1,1.5]}`, drei `useDetectGPU()` tiers — mobile/weak GPU drops
  god-rays/DoF/SSR and full-res AO (SMAA + ContactShadows + env-map only).

---

## The world — a Minecraft main menu → four realms

**Landing = a Minecraft-style main menu.** A slowly-panning golden-hour voxel vista behind a dimmed dirt/
stone panel. The **PRIYADEEP JAISWAL** title as a chunky blocky logo (the site brands with his name — the
codename "Kalpana" never appears on screen), with an optional blocky tagline ("Portfolio · ECE, IIT
Patna"). **Stone/dirt-textured beveled buttons** (light
top-left / dark bottom-right bevel, hover-highlight, click-depress) for the realms:

> **Explore** (guided cinematic tour) · **Projects** · **Experience** · **Achievements** · **About**

The **first button click unlocks audio** (autoplay policy) — music loop starts, SFX arm. Every realm loads
on demand (only one realm's geometry in memory at a time). Camera is **cinematic click-to-travel + a guided
auto-tour** — no free-roam character controller.

### Realm 1 — Projects → a sunlit archipelago (each island BESPOKE + labeled)

Floating islands, each a **different signature landmark** matched to what the project actually is, each with
a **hanging sign** naming it, showcase panels (screenshots + live/GitHub links), and an original creature or
two for life. No two islands share a silhouette.

- **Meridian** (energy supply-chain AI) → a **control-tower over a glowing power-grid**: redstone-style
  glowing supply-lines snaking across the island, an observation tower, emissive grid nodes that pulse.
  Sign: *"Meridian — Energy Supply-Chain."*
- **TARK** (legal AI) → a **great voxel courthouse / library**: columned facade, tall stacks, floating
  contract "scrolls." Sign: *"TARK — Legal AI."*
- **Campus Cab** (campus ride-share) → a **transit hub with rails + carts** moving on tracks between
  platforms. Sign: *"Campus Cab — Campus Rides."*
- **(+ any other real project** from `../main.tex` / the APEX feed → its own bespoke landmark + sign,
  generated from data.)

### Realm 2 — Experience → a working village (EACH ROLE ITS OWN TRADE + building + sign)

A village where **every role is a distinct occupation with its own building, workstation, villager, and
sign** — this is the fix for "a bunch of occupations in one." Minimum distinct trades:

- **Windflow** → an **AI-smith at a forge/enchant-bench** (glowing anvil, ember particles).
  Sign: *"Windflow — AI Intern."*
- **IIT Patna** → a **scholar/librarian at a lectern** in a stone academy hall. Sign: *"IIT Patna — B.Tech ECE."*
- **TEDx** → an **orator on a lit speaking-stage** with a little red-carpet dais and spotlight.
  Sign: *"TEDx — Speaker/Organizer."*  *(its own building — not merged)*
- **Yavanika (dramatics)** → a **bard/performer at a theatre** with curtains and a stage.
  Sign: *"Yavanika — Dramatics."*  *(its own building)*
- **NSS** → a **helper/volunteer at a community post** (tools, a garden plot, a service banner).
  Sign: *"NSS — Community Service."*  *(its own building)*

Each building's silhouette, palette, and props are unique so you can read the trade at a glance before you
even see the sign.

### Realm 3 — Achievements → the Monument Hall (redone properly)

A grand sunlit stone hall — **beacon beams of warm light** rising from the floor, a row of **engraved stone
plinths**, each holding one **emissive medal/trophy that blooms**, with a **Monocraft nameplate** below.
Real materials (polished stone, gold-emissive accents, soft reflections on the floor via
`MeshReflectorMaterial`), not floating cartoon cups.

- Amazon ML Summer School — plinth + certificate relief.
- JEE ranks — plinth + rank engraving.
- Inter-IIT Bronze — plinth + bronze medal that catches the sun.
- (+ any others from résumé/feed.)

### Realm 4 — About / Contact → a cozy home base

A small warm voxel house at golden hour: a **mailbox** (contact), **hanging signs** for socials/links, a
lit window. Quiet and personal. Labeled.

---

## Non-negotiables (carried hard-won lessons)

- **Fast, accessible SSR text core under the world** — every résumé section as real crawlable HTML +
  JSON-LD, so recruiters on slow phones and Google get everything even with WebGL off.
- **Every structure is labeled** with an in-world Monocraft sign (accessibility + instant readability).
- **Render one realm at a time**; perf tiers + `prefers-reduced-motion` static fallback.
- **Hero structures are the make-or-break** for the "generational" bar — budget the craft into a strong
  voxel building-kit + a few true showpiece landmarks (Meridian tower, the courthouse, the Monument Hall).
- **All audio/textures/fonts strictly original or CC0/OFL** (see the asset stack above).

## Tech

Next.js (SSR/SEO core) + React Three Fiber / Three.js; greedy-meshed instanced voxels + texture atlas;
GSAP cinematic camera (fly-ins + holds, no character physics); the RTX post/lighting recipe above;
Monocraft (OFL) UI; Web Audio (gesture-gated, mute/volume); content from `../main.tex` now → APEX
`feed.json` later (per `../SHARED-INTERFACES.md` §1); Vercel deploy.

## Phased build

- **P0 — Redirect, don't wipe.** Keep the scaffolding/repo; **delete the narrator/critter dialogue system
  entirely**; swap in Monocraft; stand up the RTX lighting/material pipeline + the Minecraft main menu +
  audio unlock. *Done:* menu → click → warm world with god-rays/bloom, music starts, no narrator anywhere.
- **P1 — One island, perfected.** SSR core + **Meridian** island (bespoke tower + power-grid + sign +
  showcase panel) fully RTX-lit. *Done:* deploys; Meridian genuinely jaw-drops in real Chrome.
- **P2 — Projects archipelago.** All project islands, each bespoke + labeled + showcase.
- **P3 — Experience village + Monument Hall + About.** Every trade its own building/villager/sign; the
  redone achievements hall; the home base.
- **P4 — Cinematic + audio polish.** Guided tour timing, SFX mapping, day→golden-hour ambience, particles,
  easter eggs, mobile/perf tiers, accessibility pass.
- **P5 — APEX feed integration + the "wow" finish + deploy.**

## Verdict

Same buildable, mobile-safe spine (voxel + cinematic click-to-travel), but with the soul the last version
missed: **RTX golden-hour drama, zero cheesy narrator, a Minecraft main menu, bespoke labeled landmarks,
every trade standing on its own, and a monument hall that actually feels earned** — all shippable, all
legally clean. You land, you explore, you leave thinking *"this person is seriously good — and fun."*
