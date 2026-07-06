# BUILD_STATE — Kalpana (odyssey-v2)

*A cozy, generational-quality voxel portfolio world. Master prompt: `MASTER-PROMPT-odyssey-v2.md` · Scope: `ideation-odyssey-v2.md` · Rules: `../00-BUILD-PLAN.md`*

**Status:** 🟢 BUILDING · Started 2026-07-06

---

## Milestone checklist

- [ ] **P0** — Repo init, BUILD_STATE, Next.js scaffold + deps ← **CURRENT**
- [ ] **P1** — SSR core + Hub + Meridian island (hero + fox + showcase) + Kip + tour skeleton + warm sky
- [ ] **P2** — Full Projects archipelago (TARK, Campus Cab)
- [ ] **P3** — Experience village + Achievements Hall of Statues + About home base
- [ ] **P4** — Tour polish + Kip personality + easter eggs + day/night + sound/particles
- [ ] **P5** — APEX feed integration + mobile/perf tiers + a11y + wow finish
- [ ] **DoD** — Verified end-to-end · deployed to Vercel · live URL recorded · README

## Current state

P0 in progress: repo initialized, scaffolding Next.js app.

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

## Active blockers

- None.

## Human Review queue

- (empty — deploy lands here only if Vercel unauthed at DoD)

## Session notes

- 2026-07-06: Kickoff on Fable 5 @ xhigh. Node v26, npm 11.12.1. graphify/ponytail not present in this environment as invocable tools — using BUILD_STATE.md + git history as the durable spine (logged in lieu of graphify flushes).
