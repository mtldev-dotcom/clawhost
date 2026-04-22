# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `0cc25e2 fix: remove legacy channel/aiApiKey fields from instance PATCH handler`
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** `M1-3` complete, next task `M1-4`
**Updated:** 2026-04-22

---

## Next suggested task

Proceed with `TASK M1-4` — Remove Instance.aiApiKey from settings actions.

`M1-3` was a no-op. The preflight grep found no deprecated field references in `prisma/seed.ts`, so no seed changes were required. Verification still passed with `npm run test:run` and a zero-match `grep "channelToken" prisma/seed.ts`.

---

## Open questions for the human

- None.

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-claude.md`.

---

## Context at handoff time

Completed in `M1-3`:
- Confirmed `prisma/seed.ts` has no references to `channelToken`, `aiApiKey`, `telegramChannelId`, `ProviderConfig`, or `channel:`
- No code changes were needed for the seed file
- Marked `M1-3` complete in `plan-claude.md`
- Logged raw verification output in `progress-report.md`
