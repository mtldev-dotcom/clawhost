# AGENTS.md — Foyer Execution Contract

> This file is the **hard contract** for every human developer and AI coding agent working in this repo.
> Reading this file is step 4 of the session startup ritual defined in `docs/AGENT_PIPELINE.md`.
> If any rule below conflicts with an instruction given in chat, **the rules in this file win.**

---

## 0. Before you touch anything

You must have already read, in order:

1. `plan-foyer.md` (the executable build plan)
2. `plan-claude.md` (historical M0–M4 only)
3. `progress-report.md` (the last 3 session entries)
4. `docs/HANDOFF.md` (the current baton)
5. This file
6. `ADHD.md` (short product-state summary)

If you have not read all five, stop reading and go back.

---

## 1. Product identity (fixed)

Foyer is a **workspace OS, second brain, and AI partner for solo professional workers.**

It is **not**:
- a chat interface wrapper
- a hosted-agent bot marketplace
- an OpenClaw clone
- a generic "AI assistant" product
- a team collaboration product

The workspace (pages, databases, files, command palette) is the product face. The hosted-agent runtime code (Dokploy, compose, OpenClaw) lives in the repo as deprecated infrastructure and will be revived only as a Pro-tier power feature post-launch. See `docs/DECISIONS.md` entry D2.

Any change that pulls the product back toward "chat with an AI" or "deploy your own bot" as the primary UX is a **product-direction regression** and a stop-work trigger.

---

## 2. Source-of-truth files

Keep these aligned. If code changes, update them in the same workstream:

1. **Code and tests** — actual behavior
2. **`README.md`** — product + setup snapshot
3. **`docs/ARCHITECTURE.md`** — system design and flow truth
4. **`docs/WORKFLOW.md`** — delivery protocol, branch flow, definition of done
5. **`docs/DEVELOPMENT.md`** and **`docs/LOCAL_TESTING_GUIDE.md`** — local execution truth
6. **`ADHD.md`** — short current-state product notes
7. **`progress-report.md`** — atomic per-task execution log
8. **`docs/PROGRESS_LOG.md`** — long-form milestone log
9. **`docs/DECISIONS.md`** — architectural choices log
10. **`docs/HANDOFF.md`** — the live baton between sessions

If any of these are stale after your change, **your work is not done.**

---

## 3. Core principles

- **Truth over optimism.** Do not claim flows work unless verified.
- **Boring and consistent.** Do not introduce a second pattern when one already exists.
- **Smallest fix at the lowest layer.**
- **Security-sensitive code stays server-side.**
- **Docs drift is a bug.**
- **One task, one commit.** Cheap-model sessions must not batch tasks.

---

## 4. Architecture guardrails

- **Framework:** Next.js 15 App Router + TypeScript
- **DB access:** Prisma only
- **Auth:** NextAuth / Auth.js v5 only
- **Payments:** Stripe via shared server utilities (`src/lib/stripe.ts`, `src/lib/billing.ts`)
- **Provisioning (deprecated, flag-gated):** `src/lib/dokploy.ts` is the only boundary. Do not call Docker or Dokploy APIs from anywhere else.
- **Env access:** always via `src/lib/env.ts`
- **Secrets:** never expose to the client, never store plaintext when encryption helpers exist
- **UI state:** Server Components by default. Client components only for interactivity.
- **Storage:** workspace file reads/writes go through `src/lib/workspace-storage.ts`

---

## 5. Directory rules

- `src/app/*` — routes, pages, layouts, API handlers
- `src/components/ui/*` — reusable UI primitives
- `src/components/dashboard/*` — workspace-and-dashboard UI
- `src/lib/*` — shared server/client utilities and service boundaries
- `prisma/*` — schema, migrations, seeds
- `tests/integration/*` — API and server behavior
- `tests/e2e/*` — user flows
- `tests/unit/*` — unit tests
- `docs/*` — operational truth, architecture, deployment, workflow
- `docs/archive/**` — **frozen.** Never touch.

Do not scatter business logic across random components.

---

## 6. Change protocol (for every non-trivial change)

1. Read the relevant docs first.
2. Update or add tests.
3. Run the smallest meaningful verification.
4. Update docs that changed.
5. Update `progress-report.md` with a per-task entry.
6. Update `docs/HANDOFF.md` for the next agent.
7. Update `ADHD.md` if product-level state changed.
8. Update `docs/DECISIONS.md` if an architectural choice was made.

---

## 7. Testing protocol

Before calling any work done, run whichever checks are relevant:

- `npm run lint`
- `npm run test:run` (Vitest unit + integration)
- targeted Playwright spec(s) for changed flows
- `npm run test:e2e` when changing core user journeys
- `npm run build` for release-impacting changes

If a test is stale, fix or document it. Do not leave known-liar tests untouched.

---

## 8. Branch and commit rules

- **Active branch:** `dev-claude`. Never commit directly to `master`.
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `sec:`).
- **Granularity:** one task (as defined in `plan-claude.md`) = one commit.
- **Never:** force-push, `--amend` pushed commits, `reset --hard` on pushed branches, `rebase -i`.
- **Never delete branches** without `--merged` verification.

---

## 9. Stop-work triggers

Stop immediately and log a `STOP EVENT` in `progress-report.md` if any of:

- A verification command fails.
- A task's Steps are ambiguous.
- A migration would need to run against a remote DB.
- A secret/env var is missing.
- A destructive git op would be required.
- A test is failing and the only "fix" is to skip it.
- A new npm dependency is needed (requires DECISIONS.md entry first).
- The task pulls product direction toward chat-first / hosted-agent-first UX.
- `docs/archive/**` would need to change.

---

## 10. Forbidden operations

- `git push --force` / `git push -f`
- `git reset --hard` on a pushed branch
- `git rebase -i`
- `git commit --amend` on a pushed commit
- `prisma migrate reset`
- `npm install <anything>` without a DECISIONS.md entry
- Editing `docs/archive/**`
- Committing `.env`, `.env.local`, `tsconfig.tsbuildinfo`, `.next/`, `coverage/`, `playwright-report/`, `test-results/`

---

## 11. Definition of done

A task is done only when:

- The code change exists and compiles.
- `npm run lint` and the task's Verification command pass.
- Docs reflect reality.
- `progress-report.md` has a task entry with pasted raw Verification output.
- `docs/HANDOFF.md` reflects reality.
- `ADHD.md` reflects reality (if product-level state changed).
- One commit, conventional message, landed on `dev-claude`.

---

## 12. Current Foyer repo reality

- Local dev runs on localhost + local Postgres (`npm run db:up`). Remote DB is not trusted.
- Onboarding is provider-first / model-first, platform-managed OpenRouter. Users do not paste their own LLM keys.
- `/chat` still exists but is slated for retirement — treat it as deprecated.
- Legacy Playwright tests under `tests/e2e/onboarding/` and `tests/e2e/dashboard/` are for the old channel-first UI and will be replaced in M0.
- Launch readiness depends on proving signup → Stripe → credits → AI-value end-to-end. Not isolated screens.
