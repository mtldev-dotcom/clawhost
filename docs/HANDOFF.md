# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `master`
**Last commit:** `643298c feat: M8-4 add Extract action items button on standard/capture pages`
**Plan version:** `plan-foyer.md` at repo root
**Task in flight:** none
**State:** M8 complete (Planning Layer). Next milestone M9 (AI Partner Behaviors).
**Updated:** 2026-04-27

---

## What happened this session

- Set up local dev environment on Windows laptop (cloned from homelab)
- Fixed Windows build issue by creating not-found.tsx and global-error.tsx (next-intl compatibility)
- Completed all 4 tasks of M8 (Planning Layer):
  - M8-1: ActionItem model + migration
  - M8-2: `/api/ai/extract-actions` route — extracts action items from page content via AI
  - M8-3: `/dashboard/today` planning view — shows daily plan + open action items grouped by source
  - M8-4: "Extract action items" button on standard/capture pages

---

## Verification at M8 close

```
lint: 0 errors, 5 warnings (pre-existing)
tests: 8 files, 47 tests — all passed
build: ✓ Compiled, 30 routes — exit 0
```

---

## Next suggested task

Proceed with M9-1 in `plan-foyer.md` — "Save as page" action on Cmd+K result.

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
