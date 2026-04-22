# Overnight Repo Audit

Date: 2026-04-22
Repo: `/home/mtldev/active-dev-projects/clawhost`
Auditor: OpenClaw subagent

## Scope covered
Read and compared:
- `AGENTS.md`
- `README.md`
- `ADHD.md`
- `docs/ARCHITECTURE.md`
- `docs/WORKFLOW.md`
- `docs/DEVELOPMENT.md`
- `docs/LOCAL_TESTING_GUIDE.md`
- app structure under `src/`
- tests under `tests/`

Also checked:
- `package.json` scripts
- `prisma/schema.prisma`
- key runtime files for onboarding, dashboard, chat, provisioning, env, middleware, and settings actions
- current `git status`

## High-confidence current reality
- Stack is real: Next.js App Router + TypeScript + Prisma + NextAuth + Stripe + Dokploy.
- App structure matches the current product surface:
  - auth pages in `src/app/(auth)`
  - onboarding in `src/app/onboarding`
  - chat in `src/app/chat`
  - dashboard/settings/skills in `src/app/dashboard/*`
  - provisioning boundary in `src/lib/dokploy.ts`
- Scripts are current and coherent:
  - `npm run lint` -> `eslint .`
  - `npm run test:run` -> Vitest
  - `npm run test:e2e` -> Playwright
- Tests exist, but E2E truth is mixed:
  - integration coverage around auth, instance API, skills API
  - Playwright coverage for auth, onboarding, settings
  - current E2E files still encode older flow assumptions in multiple places

## Confirmed doc/code drift

### 1) Onboarding docs are partly current, partly stale
Current code in `src/app/onboarding/page.tsx` is a 3-step provider-first flow:
1. choose provider + test API key
2. choose model
3. deploy, then redirect to `/chat`

But `docs/LOCAL_TESTING_GUIDE.md` still documents a 5-step Telegram-first wizard with pairing during onboarding and says success redirects to `/dashboard`.

Impact:
- this is the clearest stale-doc area
- anyone following the local test guide will test the wrong product

### 2) E2E tests are stale against the current UI
`tests/e2e/onboarding/wizard.spec.ts` and parts of `tests/e2e/dashboard/settings.spec.ts` still expect:
- channel-first onboarding
- `Continue` buttons for old step flow
- redirect to `/dashboard/settings` or `/dashboard`

Current onboarding code redirects to `/chat` after deployment.

Impact:
- these tests are known-liar tests right now
- do not treat failing onboarding/settings Playwright specs as product regressions without revalidation

### 3) Logout expectation drift
`src/components/dashboard/DashboardHeader.tsx` uses `signOut({ callbackUrl: '/' })`.
`tests/e2e/auth/logout.spec.ts` expects redirect to `/`.

But repo notes in `README.md` and `ADHD.md` say logout currently lands on `/login` in real runs.

Impact:
- either runtime behavior is drifting from component intent, or the docs captured a previous observed result that no longer matches code
- this needs fresh verification before touching auth navigation

### 4) Branding/docs drift is still present
Repo-level docs say ClawHost, but product copy and support docs still contain `NestAI` references, including:
- `ADHD.md`
- `src/components/PublicNav.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/i18n/messages/en.json`
- `src/i18n/messages/fr.json`
- several `docs/dev/*` files

Impact:
- product naming is not internally consistent
- avoid “small cleanup” edits here without deciding whether ClawHost fully replaces NestAI or remains partly legacy

### 5) Local testing guide has stale branch/setup assumptions
`docs/LOCAL_TESTING_GUIDE.md` says:
- `git checkout dev-V1`
- `git pull --ff-only origin master`

This is procedural guidance, not durable repo truth. It will go stale repeatedly.

## High-confidence hotspots

### Hotspot A: Onboarding -> instance persistence -> deploy path
Files:
- `src/app/onboarding/page.tsx`
- `src/app/api/instance/route.ts`
- `src/app/api/provision/route.ts`
- `src/app/dashboard/settings/actions.ts`
- `src/lib/dokploy.ts`

Why it is hot:
- current product flow crosses UI, DB writes, async provisioning, and redirect behavior
- tests and docs disagree here already
- small changes can break launch-critical flow silently

### Hotspot B: Chat readiness and gateway connection
Files:
- `src/app/chat/page.tsx`
- `src/app/api/chat/history/route.ts`
- `src/app/api/chat/send/route.ts`
- `src/app/api/chat/ws-client/*` if expanded later
- provisioning fields in `Instance`

Why it is hot:
- chat depends on `containerHost`, `gatewayToken`, `gatewayPort`, and instance status all being correct
- this is a real cross-boundary integration point, not just UI
- docs mention chat as landed, but end-to-end proof is still thin

### Hotspot C: Provider/channel settings and backward-compat instance fields
Files:
- `src/app/dashboard/settings/client.tsx`
- `src/app/dashboard/settings/actions.ts`
- `prisma/schema.prisma`
- `src/app/api/instance/route.ts`

Why it is hot:
- repo currently carries both `Instance.aiProvider/aiApiKey` and normalized `ProviderConfig`
- settings actions update both for backward compatibility
- this is a migration seam and easy place to create partial-state bugs

## Risky areas to avoid touching blindly

### 1) Secret handling is not fully aligned with the stated security story
Docs repeatedly say provider keys are encrypted at rest.
A crypto module exists at `src/lib/crypto.ts`.
But this audit did not find active usage of that module in the current provider save/update paths.
`saveProvider`, `setActiveProvider`, and `PATCH /api/instance` appear to persist raw API keys directly.

Risk:
- security-sensitive area
- do not refactor casually without tracing every read/write path and any existing stored data assumptions

### 2) Test fixtures still contain sensitive-looking literals
`tests/setup/test-fixtures.ts` contains real-looking OpenAI and Telegram test credentials.
Even if revoked or dummy, this is repo-risky and should be treated as sensitive debt.

Risk:
- accidental leakage / false confidence about test isolation
- history may already have exposure

### 3) `src/lib/dokploy.ts` mixes old and new provisioning patterns
This file contains:
- Dokploy API orchestration
- local Docker fallback
- command validation helpers
- gateway token retrieval
- pairing approval
- container exec logic

Risk:
- large blast radius
- easy to break local and remote flows differently
- should be changed only with targeted verification

### 4) Route model is split between `/chat` and `/dashboard`
Current repo has:
- actual chat page at `/chat`
- dashboard page at `/dashboard` rendering `ChatInterface`
- nav link to `/chat`
- middleware/home/login mostly oriented around `/dashboard`
- tests expecting `/dashboard`

Risk:
- route semantics are not fully settled
- do not touch redirects/nav/tests independently

## Focused factual checks run
- Located repo and doc set under `/home/mtldev/active-dev-projects/clawhost`
- Enumerated `src/` and `tests/` trees
- Read package scripts from `package.json`
- Read key implementation files for onboarding, dashboard, settings, chat, provisioning, env, middleware
- Ran `git status --short`
  - untracked: `playwright-report/`
  - untracked: `test-results/`
- Grepped for branding drift and route drift references

No speculative code changes were made.

## Recommended next moves
1. Re-baseline the launch path as the real truth source:
   signup -> login -> onboarding -> deploy -> `/chat` -> settings/skills
2. Rewrite or quarantine stale Playwright specs before using them as gating signal.
3. Decide the route truth: is chat primarily `/chat` or `/dashboard`.
4. Audit and fix API key storage/encryption before any broader launch claims.
5. Remove or replace sensitive-looking fixture credentials and consider a history scrub follow-up.

## Bottom line
ClawHost is not a random mess. The main issue is truth drift at the exact launch-critical seams: onboarding, route expectations, E2E coverage, and secret-handling claims. Those are the places to treat carefully, and they are the places most likely to mislead the next person touching the repo.
