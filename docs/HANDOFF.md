# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `690f7c3 chore: M5-1 inventory clawhost references for Foyer rebrand`
**Plan version:** `plan-foyer.md` at repo root
**Task in flight:** none
**State:** M5 in progress, M5-1 complete (inventory done)
**Updated:** 2026-04-26

---

## What happened this session

- Completed M5-1: Inventory of all ClawHost/clawhost references
- Full grep output classified into 3 buckets:
  - **A (user-visible):** 14 files need renaming to Foyer
  - **B (doc/internal):** 15+ docs need updating
  - **C (deprecated infra):** Leave as-is per AGENTS.md §1

---

## Next suggested task

Proceed with `TASK M5-2` — Rebrand package.json and tooling metadata.

---

## Open questions for the human

- Domain registration (foyer.work preferred) still pending
- Favicon swap needs Foyer wordmark from human

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-foyer.md`.
