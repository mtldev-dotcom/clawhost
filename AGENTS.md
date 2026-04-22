# AGENTS.md — ClawHost Working Contract

This file is the execution contract for human developers and AI coding agents working in this repo.

## 1. Source of truth

Maintain these as the truth source for the app. If code changes, update them in the same workstream.

1. Code and tests for actual behavior
2. `README.md` for product + setup snapshot
3. `docs/ARCHITECTURE.md` for system design and flow truth
4. `docs/WORKFLOW.md` for delivery protocol, branch flow, and definition of done
5. `docs/DEVELOPMENT.md` and `docs/LOCAL_TESTING_GUIDE.md` for local execution truth
6. `ADHD.md` for short current-state progress notes
7. Clawhost project page + tasks in Notion for planning and launch tracking

If any of those are stale after your change, your work is not done.

## 2. Core principles

- Prefer truth over optimism. Do not claim flows work unless tested.
- Keep the codebase boring and consistent.
- Fix the smallest layer that solves the problem.
- Do not introduce a second pattern when one already exists.
- Security-sensitive code must stay server-side.
- Treat docs drift as a bug.

## 3. Architecture guardrails

- Framework: Next.js App Router + TypeScript
- DB access: Prisma only
- Auth: NextAuth/Auth.js only
- Payments: Stripe integration through shared server utilities
- Provisioning: `src/lib/dokploy.ts` is the only provisioning boundary
- Environment access: `src/lib/env.ts` should validate env usage
- API keys and secrets: never expose to the client, never store plaintext when encryption helpers exist
- UI state: keep client components thin, prefer server-driven behavior unless interactivity requires client state

## 4. Directory rules

- `src/app/*` = routes, pages, layouts, API handlers
- `src/components/ui/*` = reusable UI primitives
- `src/components/dashboard/*` = dashboard-specific UI
- `src/lib/*` = shared server/client utilities and service boundaries
- `prisma/*` = schema, migrations, seeds
- `tests/integration/*` = API and server behavior
- `tests/e2e/*` = user flows
- `docs/*` = operational truth, architecture, deployment, workflow

Do not scatter business logic across random components.

## 5. Change protocol

For every non-trivial change:

1. Read the relevant docs first
2. Update or add tests
3. Run the smallest meaningful verification
4. Update docs that changed
5. Update `ADHD.md` with the new truth
6. Update Notion if project state, launch status, or next actions changed

## 6. Testing protocol

Before calling work done, run whichever checks are relevant:

- `npm run lint`
- `npm run test:run`
- targeted Playwright specs for changed flows
- `npm run test:e2e` when changing core user journeys
- `npm run build` for release-impacting changes

If a test is stale, fix or document it. Do not leave known-liar tests untouched.

## 7. Branch and commit rules

- Branch from the active dev branch unless instructed otherwise
- Use small focused commits
- Use conventional-style commit messages when practical
- Do not delete or rename branches casually
- Do not push broken docs claiming a green state

## 8. Definition of done

A task is done only when:

- the code change exists
- relevant checks ran
- docs reflect reality
- `ADHD.md` reflects reality
- Notion reflects reality when planning/status changed

## 9. Current ClawHost reality to respect

- Local dev runs on localhost with local Postgres for safe evaluation
- The onboarding UI is currently provider-first
- Some older E2E tests were written for an older flow and must not be treated as truth without revalidation
- Launch readiness depends on proving signup -> payment -> onboarding -> provisioning -> chat, not just isolated screens
