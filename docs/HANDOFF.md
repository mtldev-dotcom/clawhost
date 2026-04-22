# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** _(filled in after the first task commit)_
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** ready — awaiting TASK M0-1
**Updated:** 2026-04-22

---

## Next suggested task

`TASK M0-1` — Set up dev-claude branch baseline.

See `plan-claude.md` → section "Milestone M0 — Clean foundation" → `TASK M0-1`.

---

## Open questions for the human

- None at this moment. If a STOP EVENT is logged in `progress-report.md`, fill this section with the open question before ending the session.

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-claude.md`.

---

## Context at handoff time

The `dev-claude` branch was just created off `master` after merging the `overnight/2026-04-22-launch-pass` branch. Old branches `overnight/2026-04-22-launch-pass` and `dev-V1` have been deleted both locally and on origin. `master` now contains the full workspace-first merge.

The agent workflow contract (`AGENTS.md`, this file, `docs/AGENT_PIPELINE.md`, `docs/DECISIONS.md`, `docs/PROGRESS_LOG.md`, `progress-report.md`, `plan-claude.md`) was added in the same baseline commit on `dev-claude`.

All subsequent tasks start at TASK M0-1 in `plan-claude.md`.
