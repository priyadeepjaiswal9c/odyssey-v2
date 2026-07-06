# Kalpana ✦ — a voxel portfolio world

**Kalpana** ("imagination") is Priyadeep Jaiswal's portfolio as a place: a golden-hour voxel
cosmos of floating islands you tour cinematically — a control-tower island humming with power
lines, a marble courthouse-library, a campus transit hub with a live rail loop, a village of
profession-villagers, a marble hall of glowing trophies, and a cozy home base with a mailbox.
A silent glowing critter named **Kip** leads the way.

Built end-to-end in one autonomous run (odyssey-v2 of the RESUME moonshots).

## The experience

- **Minecraft-style start menu** — stone buttons, blocky logo; the first click unlocks audio.
- **Guided cinematic tour** — GSAP camera flights between 17 stops across 5 realms;
  click-to-travel via realm pills, `←`/`→` keys, or the tour dock. No free-roam, no physics.
- **RTX-ish look** — PBR materials over greedy-meshed voxels with baked per-vertex AO,
  env reflections sampled from the sky itself, soft shadows, bloom + god-rays + vignette.
- **Day/night** — 🌙 toggles a starry night where the lamps and power lines carry the scene.
- **Sound** — every click, whoosh, chime, and the ambient music loop is synthesized live in
  WebAudio. Original by construction; zero audio assets. Mute persists.
- **SSR text core** — the complete résumé is server-rendered semantic HTML underneath the
  world. Crawlers, screen readers, reduced-motion users, and no-WebGL devices get everything.
  (Also reachable any time via **📄 Text** or the skip link.)

## Architecture

```
src/
  content/          # JSON-Resume-shaped data (APEX feed contract v1)
    resume.ts       #   seed transcribed from main.tex
    loader.ts       #   FEED_URL → public/feed.json → seed (validated fallback)
  lib/
    voxel/          # engine: VoxelModel builder ops, greedy mesher (AO,
                    #   directional tints, jitter-patches, material classes)
    audio.ts        # WebAudio engine: SFX + generative ambient loop
  world/
    layout.ts       # realm geography + golden-hour palette
    stops.ts        # the tour, data-driven from the résumé
    store.ts        # zustand: phase/tour/quality/night/audio state
    CameraRig.tsx   # GSAP arc flights, idle drift, parallax, FOV breathing
    VoxelMesh.tsx   # model → per-material-class meshes + HDR glow pass
    Sky.tsx         # painterly sky shader (day/night), sun disc, clouds
    Kip.tsx         # the critter
    structures/     # bespoke builds: meridian, tark, campuscab, hub,
                    #   experience, achievements, about, villagers
    realms/         # mount-on-demand realm components (one realm at a time)
  ui/               # start menu, HUD (realm nav, tour dock, showcase cards)
  app/              # Next.js App Router: SSR core + world gate
scripts/
  shot.mjs          # visual verification: headed isolated Chrome screenshots
                    #   of every tour stop via the dev-only __kalpana hook
```

**Perf:** one greedy-meshed geometry per island per material class (a handful of draw calls
per realm), realms mount on demand, quality tiers (high/medium/low) set at boot from device
signals and stepped down automatically if FPS sags. DPR clamped per tier; postprocessing
only on high/medium.

## APEX feed (contract v1)

The world is data-driven. Publish a JSON Resume-shaped `feed.json`
(see `../SHARED-INTERFACES.md`) either at build time via `FEED_URL` or as
`public/feed.json`; it's validated and falls back to the built-in seed if absent
or malformed. Projects in the feed appear in the SSR core immediately; islands
exist for slugs in `src/world/registry.ts` (`BUILT_ISLANDS`).

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build (stop the dev server first — shared .next/)
node scripts/shot.mjs  # screenshot every tour stop → /tmp/kalpana-shots
```

## Deploy

```bash
vercel --prod --yes
```

---

*Fonts: Pixelify Sans + Nunito (Google Fonts, self-hosted by next/font). All world art is
procedural voxels; all audio is synthesized — no third-party assets anywhere.*
