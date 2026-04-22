# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `PENDING_COMMIT`
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** M0-7 complete, ready for TASK M0-8
**Updated:** 2026-04-22

---

## Next suggested task

`TASK M0-8` — Add replacement Playwright spec: workspace shell smoke

See `plan-claude.md` → section "Milestone M0 — Clean Foundation" → `TASK M0-8`.

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

TASK M0-7 completed on `dev-claude`.

Verified in this session:
- `git status` was clean
- `git branch --show-current` returned `dev-claude`
- `node --version` returned `v24.14.1`
- `npm run db:up` succeeded
- created `tests/e2e/onboarding/model-select.spec.ts` with the exact task content
- `npm run lint` exited 0 with warnings only
- `npm run test:run` exited 0
- `ls tests/e2e/onboarding/model-select.spec.ts` returned the file path
- plan updated to mark `M0-7` complete

`progress-report.md` includes the raw command output for this session.
Next agent should start at TASK M0-8 and follow the same contract.
