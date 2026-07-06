# BUILD_STATE — Kalpana (odyssey-v2)

*A cozy, generational-quality voxel portfolio world. Master prompt: `MASTER-PROMPT-odyssey-v2.md` · Scope: `ideation-odyssey-v2.md` · Rules: `../00-BUILD-PLAN.md`*

**Status:** ✅ BUILD COMPLETE (Definition of Done) · 2026-07-06 · one item in Human Review (the production deploy)

---

## Milestone checklist

- [x] **P0** — Repo init, BUILD_STATE, Next.js scaffold + deps ✅ c952dee
- [x] **P1/P1R** — SSR core + Hub + Meridian (RTX pivot applied: PBR, start menu, audio, narrator cut, control-tower rebuild) ✅ c1e54b7
- [x] **P2** — Full Projects archipelago (TARK courthouse-library, Campus Cab transit hub) ✅ 933373d
- [x] **P3** — Experience village + Hall of Achievements + About home base ✅ 57d0758
- [x] **P4** — Day/night + particles + Kip personality + easter eggs + cinematic flights ✅ 83537f2
- [x] **P5** — Feed contract verified + perf governor + a11y + favicon + README ✅ e31af70
- [x] **DoD** — Verified end-to-end (17-stop suite, interactive tour, mobile, SSR crawl, zero page errors) · README ✅ · **deploy queued to Human Review** ⬇

## ⚡ DIRECTION UPDATE — LOCKED 2026-07-06 (supersedes conflicts)

1. **RTX-realistic look**: PBR + env reflections + soft shadows + god-rays + bloom + subtle DoF. Warm golden-hour, **no purple anywhere**.
2. **Narrator cut**: no dialogue/subtitle overlay. Kip stays as silent, subtle critter.
3. **Bespoke island per project**: Meridian = control-tower/power-grid · TARK = courthouse/library · Cab = transit hub w/ rails · Windflow = AI forge/lab · Achievements = trophy hall.
4. **Minecraft-style start menu**: blocky KALPANA logo, stone/dirt beveled buttons, first click unlocks audio.
5. **SFX + ambient music**: WebAudio-synthesized (100% original by construction — zero licensing risk), gesture-gated, mute/volume toggle.
6. Redirect existing scaffolding — engine/SSR/tour architecture retained.

## Current state

P1R done + verified (screenshot suite `/tmp/kalpana-shots`, interactive click-through, zero page errors, prod build 107kB first-load). Starting P2: TARK courthouse/library island + Campus Cab transit-hub island, then flip `BUILT_ISLANDS` in `src/world/registry.ts`.

**Workflow guards (learned hard):**
- NEVER `npm run build` while `next dev` runs — they share `.next/` and corrupt each other. Stop dev → build → restart dev.
- Visual verify: `node scripts/shot.mjs` (headed isolated Chrome; R3F v9 won't boot in hidden/occluded tabs or headless — by design it recovers on visibility, so prod is fine).
- `__kalpana.snap()` must kill GSAP flights (done) or teleports get overridden.

## Decisions log

| # | Decision | Rationale |
|---|---|---|
| D1 | Paths in master prompt (`../../main.tex`) are off by one level; actual source is `../main.tex`, contract `../SHARED-INTERFACES.md` | Verified on disk; content confirmed present |
| D2 | Repo-local git identity: Priyadeep Jaiswal <priyadeep_2401ec10@iitp.ac.in> | No global git identity configured; used résumé identity for the portfolio repo |
| D3 | Hand-scaffold Next.js (App Router, TS) instead of create-next-app | Folder already contains docs; full control over structure |
| D4 | Voxel rendering: greedy-meshed merged geometry with per-vertex colors + baked vertex AO (one mesh per structure/island); InstancedMesh reserved for dynamic bits (critter, particles, clouds) | Fewer draw calls than raw instancing per cube; baked AO is the single biggest "looks generational" lever for voxels |
| D5 | Showcase panels: in-world voxel screens + camera-synced overlay cards for text/links (no textures of text in-world) | Crisp readable text at all DPRs, accessible links, light + fast |
| D6 | Vercel CLI absent on machine; will attempt `npx vercel --prod --yes` at DoD, else queue deploy to Human Review | Per master prompt fallback rule |
| D7 | Fonts: Pixelify Sans (display, voxel-flavored) + Nunito (body/UI) via next/font | Cozy + voxel vibe, self-hosted by Next |
| D8 | Verification: puppeteer-core + system Chrome headless (user's visible Chrome window kept getting occluded → RAF paused → unverifiable). Dev-only `__kalpana.snap()` hook for deterministic framing | Deterministic screenshots for every stop, no window-focus dependency |
| D9 | Audio: synthesize ALL SFX + ambient music with WebAudio (no asset files) | "Original/CC0 only" made trivially true — original by construction; zero bundle weight |
| D10 | RTX pipeline: mesher emits material-class groups (matte/gloss/metal/water/glow) → MeshStandardMaterial + PMREM env from own sky; @react-three/postprocessing Bloom/GodRays/DoF/Vignette by tier | Real PBR without texture assets; reflections match the actual sky |
| D11 | God-rays + DoF high tier only; bloom high+medium; halo sprites only on low tier (bloom replaces them) | Perf tiers per master prompt |

## Active blockers

- None.

## Human Review queue

1. **Production deploy** — Vercel CLI is installed via npx and **authenticated** (`priyadeepjaiswal9c-7613`); the harness permission gate classified the prod deploy as human-review territory. Everything is verified and ready. To ship, run:
   ```bash
   cd odyssey-v2 && npx vercel --prod --yes
   ```
   Then paste the live URL here. (Custom domain purchase, if desired, is also Human Review per plan.)

## Session notes

- 2026-07-06: Kickoff on Fable 5 @ xhigh. Node v26, npm 11.12.1. graphify/ponytail not present in this environment as invocable tools — using BUILD_STATE.md + git history as the durable spine (logged in lieu of graphify flushes).
