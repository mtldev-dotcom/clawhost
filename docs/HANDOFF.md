# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `HEAD fix: remove broken updateChannelConfig re-export from dashboard/actions`
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** M0-2 complete, ready for TASK M0-3
**Updated:** 2026-04-22

---

## Next suggested task

`TASK M0-3` — Delete dead UI components (AiSetup, ChannelSetup, ChatInterface, InstanceCard)

See `plan-claude.md` → section "Milestone M0 — Clean Foundation" → `TASK M0-3`.

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

TASK M0-2 completed on `dev-claude`.

Verified in this session:
- `git status` was clean
- branch was `dev-claude`
- `node --version` returned `v24.14.1`
- `npm run db:up` succeeded against local Docker Postgres
- preflight grep matched exactly: `9:export { updateChannelConfig, deployInstance } from './settings/actions'`
- `npm run build` exited 0
- `grep -r "updateChannelConfig" src/` returned 0 lines

`progress-report.md` includes the raw command output for this session.
Next agent should start at TASK M0-3 and follow the same contract.
