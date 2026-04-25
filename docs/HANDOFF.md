# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `dev-claude`
**Last commit:** (pending — M1-5 close commit)
**Plan version:** `plan-claude.md` at repo root
**Task in flight:** none
**State:** `M1 complete`, next milestone `M2`
**Updated:** 2026-04-25

---

## Next suggested task

Proceed with `TASK M2-1` — Remove dev-grade copy from WorkspaceShell.

M1-5 was a verification + close pass. All tasks M1-1 through M1-5 are complete. The full suite (`lint && test:run && build`) passes cleanly.

---

## Key fixes landed this session (not in plan)

- **Build was broken** by `NODE_ENV=development` set in shell environment. Fixed by hardcoding `NODE_ENV=production` in the `package.json` build script. Do not remove this.
- **`AUTH_SECRET`** added to `.env.local` — next-auth v5 reads this key (v4 used `NEXTAUTH_SECRET`). Both are now present.
- **`allowedDevOrigins`** added to `next.config.ts` for Tailscale IP (`100.119.162.2`).

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

Completed in `M1-5`:
- Ran full verification suite: `npm run lint && npm run test:run && npm run build`.
- Lint: 0 errors, 7 warnings (all pre-existing).
- Tests: 7 files, 45 tests — all passed.
- Build: compiled successfully, 12/12 static pages, 22 dynamic routes.
- Updated `docs/HANDOFF.md`, `progress-report.md`, `docs/PROGRESS_LOG.md`.
- Marked `M1-5` complete in `plan-claude.md`.
