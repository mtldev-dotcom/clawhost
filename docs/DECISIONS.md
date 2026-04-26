# Architectural Decisions Log (ADR-lite)

> Append-only. Every non-trivial architectural or tooling choice gets a one-paragraph entry.
> Never delete or edit past entries. If a decision is reversed, add a new entry that references the old one.

---

## D1 — 2026-04-22 — Use `plan-claude.md` as the cheap-model execution contract

**Context:** The human operator wants a cheap OpenRouter model (candidates: `deepseek/deepseek-v3.2`, `minimax/minimax-m2.7`) to execute the full launch roadmap autonomously. Cheap models are weak at judgment but strong at following explicit, atomic, verifiable steps.

**Decision:** The entire build plan is encoded as a single file, `plan-claude.md`, at repo root. The file contains numbered atomic tasks (M0-1, M0-2, …), each with Preflight / Steps / Verification / Mark-complete sections. All file content the executor needs to paste lives in the appendices of that file. No task requires the executor to invent content or make architectural choices.

**Consequences:** `plan-claude.md` is large (~1000 lines) by design. Cheap models handle long files better than ambiguity. Every commit on `dev-claude` is expected to correspond one-to-one with a checked-off task.

**Status:** Active.

---

## D2 — 2026-04-22 — Product identity: Workspace OS for SMBs, not a hosted-agent wrapper

**Context:** The repo previously had split personality between a "workspace-first product" (pages, databases, files) and a "hosted OpenClaw agent" platform. The human operator confirmed the product is the first, not the second.

**Decision:** ClawHost is an AI-powered workspace OS targeting small and medium business owners and professional workers. The hosted-agent runtime (Dokploy + OpenClaw compose) stays in the codebase as deprecated infrastructure behind a feature flag, with no user-facing surface in v1. The `/chat` route is slated for retirement in favor of an embedded command palette (Cmd-K) inside the workspace.

**Consequences:**
- Dead or dying code paths to remove: `src/components/dashboard/AiSetup.tsx`, `ChannelSetup.tsx`, `ChatInterface.tsx`, `InstanceCard.tsx`; `src/app/api/onboarding/test-provider/`, `approve-pairing/`; `/chat` route (later).
- Database schema cleanup: drop `Instance.channel`, `channelToken`, `aiApiKey`, `telegramChannelId`; drop `ProviderConfig` model (planned in milestone M1).
- `Instance` model stays (renamed meaning: "deprecated agent runtime record") until the hosted-agent tier is revived as a paid Pro feature post-launch.

**Status:** Active. Drives all milestones M1–M5.

---

## D3 — 2026-04-22 — Branch strategy: dev-claude forks from master after merge

**Context:** Before this session, the repo had three active branches (`master`, `overnight/2026-04-22-launch-pass`, `dev-V1`). `dev-V1` was fully contained in `overnight`. The operator wanted a clean start.

**Decision:** `overnight/2026-04-22-launch-pass` was merged into `master` via `--no-ff` merge commit. `dev-V1` had no unique commits and was deleted. A new branch `dev-claude` was cut from the post-merge `master`. All future work by the cheap-model executor happens on `dev-claude` until a milestone closes and a PR back to `master` is opened.

**Consequences:** `master` is the release trunk. `dev-claude` is the active work branch. No other long-lived branches exist. Old branches are gone both locally and on `origin`.

**Status:** Active.

---

## D4 — 2026-04-25 — Use Postgres full-text search instead of a vector database for workspace context

**Context:** M3 requires the AI command palette to retrieve relevant workspace pages as context before calling OpenRouter. Options: (a) a vector database (pgvector, Pinecone, Weaviate), (b) Postgres built-in FTS with tsvector/tsquery, (c) naive LIKE search.

**Decision:** Use Postgres GIN full-text search (tsvector + plainto_tsquery). No new infrastructure, no embedding generation pipeline, no API keys for a second service. Workspace pages are short and keyword-heavy enough that FTS recall is acceptable for v1. Falls back to recency-ordered pages when the query string is empty.

**Consequences:** No semantic similarity search (e.g. "clients" won't match "customers"). Vector search can be layered on later (pgvector extension) without changing the retrieval API surface — `retrieveWorkspaceContext` returns the same `WorkspaceContextChunk[]` shape regardless of backend. For v1 SMB workspaces (< 1000 pages) performance is not a concern.

**Status:** Active.

---

<!--
Template for future entries:

## D<n> — YYYY-MM-DD — <short title>

**Context:** <why this decision was needed>
**Decision:** <what was chosen>
**Consequences:** <what changes, what is locked in, what is given up>
**Status:** Active | Superseded by D<m> | Reverted
-->
