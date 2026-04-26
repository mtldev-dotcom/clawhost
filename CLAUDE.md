# CLAUDE.md — Foyer Pointer File

This file is **not** the source of truth. It points at the files that are. Foyer is a workspace OS for solo professionals.

---

## Read these first (in order)

1. `plan-foyer.md` — the executable build plan (work queue)
2. `plan-claude.md` — historical M0–M4 only
3. `progress-report.md` — the per-task execution log (last 3 entries)
4. `docs/HANDOFF.md` — the live baton between sessions
5. `AGENTS.md` — the hard execution contract
6. `ADHD.md` — short product-state summary
7. `docs/AGENT_PIPELINE.md` — the 9-step pipeline

If any of those are stale after your change, your work is not done.

---

## Intended executor

The agent running `plan-foyer.md` is a cheap OpenRouter model (preferred: `deepseek/deepseek-v3.2`; fallback: `minimax/minimax-m2.7`). See Appendix K of `plan-claude.md` for the boot prompt.

Claude Sonnet (this model) is used for:
- branch cleanup and destructive git operations
- drafting `plan-foyer.md` and appendices
- milestone close audits
- stop-event triage

---

## Current intent

Optimize for:
- tight scoped changes (one task, one commit)
- truth-aligned docs (no optimism)
- clean commits on `dev-claude`
- current product direction: **Foyer — workspace OS, second brain, AI partner for solo professionals**

---

## Archive note

Old agent-build scaffolding and historical orchestration docs live under `docs/archive/2026-04-22-legacy/`.
Do not treat those files as current execution truth. Do not edit them.
