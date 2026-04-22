# Workflow and Delivery Protocol

This document defines how ClawHost work should move from idea to merged code.

## Source of truth policy

Always keep these aligned:

- code
- tests
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/LOCAL_TESTING_GUIDE.md`
- `ADHD.md`
- Notion project page and launch tasks

If one changes and the others stay stale, the repo is lying.

## Standard work pipeline

1. Understand the target behavior
2. Read the relevant docs and existing code path
3. Confirm whether current tests still reflect reality
4. Implement the change
5. Add or fix tests
6. Run verification
7. Update docs and `ADHD.md`
8. Update Notion if roadmap, status, or next steps changed

## Preferred implementation order

### Product flow changes
- update architecture assumptions first
- change server/API behavior
- change UI behavior
- update tests
- update docs and Notion

### Schema changes
- update `prisma/schema.prisma`
- create migration
- regenerate Prisma client if needed
- update affected API/routes/tests
- update docs

### Provisioning or billing changes
- keep integration boundaries centralized
- avoid duplicating Stripe or Dokploy logic outside shared service files
- verify with targeted checks before broad refactors

## Coding protocols

### API routes
- validate input
- return explicit status codes
- avoid leaking sensitive internals
- keep orchestration thin, move reusable logic into `src/lib/*`

### Components
- use server components by default
- use client components only for state, effects, or browser APIs
- keep page files readable, extract repeated UI

### State and side effects
- avoid unnecessary global state
- prefer direct route handlers or server actions over ad hoc client fetch chains
- keep side-effect boundaries explicit

### Security rules
- secrets stay server-side
- sanitize inputs before shell or provisioning boundaries
- do not log tokens or private keys
- keep encryption and rate-limiting protections intact

## Verification protocol

Minimum meaningful checks:

- small UI/content change: lint + targeted test or smoke check
- auth/onboarding/dashboard change: lint + `npm run test:run` + targeted Playwright
- launch-critical change: lint + tests + `npm run build` + real flow validation where possible

## Documentation protocol

When behavior changes, update the docs in the same pass.

At minimum, touch whichever of these became stale:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/LOCAL_TESTING_GUIDE.md`
- `ADHD.md`

## Planning protocol

Use Notion for:
- project status
- launch stage
- next tasks
- owner/priority tracking

Use repo docs for:
- how the app is designed
- how the app is developed and tested
- how contributors should behave inside this codebase

## Definition of done

Work is not done until behavior, tests, docs, and planning all agree.
