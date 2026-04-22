# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** `6ce4203 refactor: remove deprecated Instance fields and ProviderConfig model via migration`
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** `M1-1` complete, next task `M1-2`
**Updated:** 2026-04-22

---

## Next suggested task

Proceed with `TASK M1-2` — Update `/api/instance` PATCH to reject legacy fields.

`M1-1` was adapted to current repo reality under explicit human override. The schema cleanup migration landed together with the minimum code/test updates needed to safely remove the deprecated schema fields without leaving broken references behind.

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

Completed in `M1-1`:
- Removed `Instance.channel`, `Instance.channelToken`, `Instance.aiApiKey`, and `Instance.telegramChannelId` from `prisma/schema.prisma`
- Removed the `ProviderConfig` model and `Instance.providers` relation
- Created and applied migration `20260422233721_remove_deprecated_instance_fields`
- Regenerated Prisma client
- Updated runtime code and tests to stop depending on the removed schema fields
- Verified with `npm run build`, `npm run test:run`, and schema grep checks
