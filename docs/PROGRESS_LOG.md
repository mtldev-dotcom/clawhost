# Progress Log (Long-form)

> This file is the **long-form** engineering log.
> For the atomic, per-task execution log read `progress-report.md` at repo root.
> For short product-level notes read `ADHD.md` at repo root.

Entries in this file are **append-only** and written at milestone close.

Format:

```
## YYYY-MM-DD — <milestone or topic>
**Summary:** <one paragraph>
**What changed in the product:** <bullets>
**What changed in the codebase:** <bullets>
**Verification:** <commands + result>
**Open items:** <bullets or "none">
```

---

## 2026-04-22 — Repo reset and agent workflow contract

**Summary:** Cleaned up the branch graph, merged the overnight workspace-first work into `master`, created a fresh `dev-claude` branch, and established a hard execution contract for cheap-model agents.

**What changed in the product:** Nothing user-visible. This is a governance and repo-hygiene milestone.

**What changed in the codebase:**
- Merged `overnight/2026-04-22-launch-pass` → `master` via `--no-ff`
- Deleted `dev-V1` (fully contained in overnight) and `overnight/2026-04-22-launch-pass` locally and on origin
- Created `dev-claude` off post-merge `master`
- Added `plan-claude.md`, `progress-report.md`, `docs/AGENT_PIPELINE.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, `docs/PROGRESS_LOG.md`
- Rewrote `AGENTS.md` and `CLAUDE.md` as a hard contract
- Tightened `.gitignore`
- Archived legacy docs removal (already staged before merge)

**Verification:** `git branch -a` shows only `master` and `dev-claude` locally plus their remotes.

**Open items:** TASK M0-1 (and onward) awaiting execution by the designated cheap-model runner.

## 2026-04-22 — M0 close: Clean Foundation

**Summary:** Closed milestone M0 with a full verification pass after removing dead code, retiring stale onboarding-era specs, adding replacement smoke coverage for the current workspace flow, and landing baseline CI.

**What changed in the product:**
- The workspace-first product surface is cleaner, with dead dashboard components and legacy onboarding API routes removed
- Test coverage now better matches the current onboarding model-select flow and workspace shell instead of the retired channel-first UI
- CI now runs lint, unit/integration tests, and build on pushes and pull requests

**What changed in the codebase:**
- Removed broken re-exports, dead dashboard components, dead onboarding API routes, and orphan checks from the M0 cleanup list
- Replaced stale Playwright specs with `tests/e2e/onboarding/model-select.spec.ts` and `tests/e2e/workspace/workspace-shell.spec.ts`
- Added `.github/workflows/ci.yml`
- Updated `ADHD.md`, `plan-claude.md`, `progress-report.md`, and `docs/HANDOFF.md` to reflect M0 completion

**Verification:** `npm run lint && npm run test:run && npm run build` passed in one run at milestone close.

**Open items:** Next up is `TASK M1-1` for schema cleanup.
