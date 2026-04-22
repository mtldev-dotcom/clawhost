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
