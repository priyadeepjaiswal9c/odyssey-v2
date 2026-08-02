# Kalpana ✦ — a voxel portfolio world

**Kalpana** ("imagination") is Priyadeep Jaiswal's portfolio as a *place*: a golden-hour cosmos
of floating voxel islands you explore — a control-tower island humming with power lines, a marble
courthouse-library, a campus transit hub, the Guilds and Commons of experience, a hall of glowing
trophies, and a cozy home island crowned with the name.

Two ways in, chosen from the landing:

- **Enter the world** — the 3D experience.
- **Classic view** — a warm, minimal, motion-driven reading version for anyone who'd rather skim.

## The 3D experience

- **Explore, don't watch** — eight cinematic stops (hub → three project islands → work → extra-
  curricular → achievements → contact). Scroll or use the ‹ › chevrons to move between them; **drag
  anywhere to orbit** the island you're on and see it from any angle.
- **A quiet welcome** — first-time visitors get a one-time, minimalist guidance layer pointing at
  drag-to-look, the day/night switch, and the classic view; it fades on first interaction.
- **Golden-hour look** — PBR materials over greedy-meshed voxels with baked per-vertex AO, sky-
  sampled reflections, soft shadows, bloom + god-rays. A soft dark-blue **night** mode with stars.
- **Live audio** — every click, whoosh and chime plus the ambient loop is synthesized in WebAudio;
  zero audio assets. Mute persists.
- **Always readable** — the résumé is server-rendered underneath, so crawlers, screen readers and
  no-WebGL devices get everything; the Classic view is one click away at any time.

## The classic view (`/classic`)

A statically-served reading experience that still feels alive: **Lenis** smooth scroll, **Framer
Motion** entrance reveals on every block, a word-flip hero, a sliding section-nav indicator, a
scroll progress bar and parallax ambience. **Light + dark** themes (remembered per visitor),
warm and deliberately minimal — typography and whitespace over boxes and color.

## Architecture

```
src/
  content/        # JSON-Resume-shaped data + loader (APEX feed contract; falls back to seed)
  lib/voxel/      # engine: VoxelModel builder, greedy mesher (AO, tints, material classes)
  lib/audio.ts    # WebAudio engine: SFX + generative ambient loop
  world/
    layout.ts       # realm geography + golden-hour palette
    stops.ts        # the eight-stop tour, data-driven from the résumé
    store.ts        # zustand: phase / stop / quality / night / audio
    CameraRig.tsx   # GSAP arc flights, idle drift, pointer parallax, drag-to-orbit
    VoxelMesh.tsx   # model → per-material-class meshes + HDR glow
    Sky.tsx         # day/night sky shader, sun/moon disc, clouds
    structures/     # bespoke builds: meridian, tark, campuscab, hub, experience, …
    realms/         # mount-on-demand realm components (one realm at a time)
  ui/
    EntryGate.tsx     # the landing: choose world or classic
    Hud.tsx           # top bar, edge nav, showcase cards, scroll hint
    GuideLayer.tsx    # one-time welcome coach marks
    ClassicResume.tsx # the animated classic view (Motion + Lenis)
  app/            # Next.js App Router — SSR core + world gate + /classic
scripts/          # headless-Chrome screenshot harness (every stop via the dev-only hook)
```

**Performance:** one greedy-meshed geometry per island per material class, realms mount on demand,
quality tiers set at boot and stepped down automatically if FPS sags, DPR clamped per tier,
postprocessing only on high/medium. Fonts: **Space Grotesk** (display) + **Nunito** (body), self-
hosted via `next/font`. All world art is procedural voxels; all audio is synthesized.

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build (stop the dev server first — shared .next/)
node scripts/shot.mjs  # screenshot every stop → /tmp/kalpana-shots
```

## Deploy

Import the repo at [vercel.com/new](https://vercel.com/new) (Next.js is auto-detected — no config
needed), or with the CLI:

```bash
vercel --prod
```

---

*Built with Next.js · React Three Fiber · drei · Framer Motion · Lenis · GSAP · Zustand.*
