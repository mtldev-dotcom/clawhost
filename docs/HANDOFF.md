# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `d7cef83 fix: sync npm lockfile for CI and correct M1-1 commit records`
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** `M1-2` complete, next task `M1-3`
**Updated:** 2026-04-22

---

## Next suggested task

Proceed with `TASK M1-3` — Update seed file to remove deprecated fields.

`M1-2` verified that `/api/instance` already rejects the removed legacy fields. No route code change was needed in this session because the `PATCH` handler was already narrowed to `aiProvider` and `activeModel` only.

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

Completed in `M1-2`:
- Confirmed `src/app/api/instance/route.ts` already uses `const { aiProvider, activeModel } = await req.json()` in `PATCH`
- Confirmed there are no `channelToken` references left in that route
- Verified with `npm run build`, `npm run test:run`, and `grep "channelToken" src/app/api/instance/route.ts`
