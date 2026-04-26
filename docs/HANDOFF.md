# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `(see below after final commit)`
**Plan version:** `plan-foyer.md` at repo root
**Task in flight:** none
**State:** M5 complete (Foyer rebrand). Next milestone M6 (Solo pro onboarding & templates).
**Updated:** 2026-04-26

---

## What happened this session

- Completed all 14 tasks of M5 (Foyer rebrand):
  - M5-1: Inventory of all ClawHost references
  - M5-2: Rebranded package.json to `foyer`
  - M5-3: Updated app metadata (title, description)
  - M5-4: Rebranded EN UI copy + AI system prompt
  - M5-5: Rebranded FR locale strings
  - M5-6: Updated ToS and Privacy pages
  - M5-7: Rewrote README.md for Foyer
  - M5-8: Updated AGENTS.md, CLAUDE.md, ADHD.md
  - M5-9: Rewrote public landing page for solo professionals
  - M5-10: Hidden /chat and /skills routes from navigation
  - M5-11: Created docs/LAUNCH_PROOF.md
  - M5-12: Created docs/BRAND.md with domain/brand decisions
  - M5-13: Final sweep confirmed no user-visible ClawHost strings
  - M5-14: Milestone close with full verification

---

## Verification at M5 close

```
lint: 0 errors, 7 warnings (all pre-existing)
tests: 8 files, 47 tests — all passed
build: ✓ Compiled, ✓ 28 routes — exit 0
```

---

## Next suggested task

Proceed with `TASK M6-1` — Reframe onboarding step copy for solo pros.

---

## Open questions for the human

- Domain registration (foyer.work preferred) still pending
- Favicon swap needs Foyer wordmark from human
- Stripe webhook registration at production domain

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-foyer.md`.
