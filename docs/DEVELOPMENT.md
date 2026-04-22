# Development Guide

This file is the local development truth source.

## Read First

Before non-trivial work:
- `AGENTS.md`
- `docs/WORKFLOW.md`
- `docs/ARCHITECTURE.md`
- `ADHD.md`

## Local Setup

### Prerequisites
- Node.js 18+
- Docker
- Git

### Boot the repo
```bash
git clone https://github.com/mtldev-dotcom/clawhost.git
cd clawhost
npm install
cp .env.example .env.local
```

### Important local rule
Keep local development pointed at **localhost + local Postgres** unless you are intentionally validating a remote environment.

### Start local DB
```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

### Start app
```bash
npm run dev
```

## Core Commands

```bash
npm run dev
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm run db:up
npm run db:down
npm run db:migrate
npm run db:seed
npm run db:studio
npm run stripe:listen
```

## Environment Truth

Minimum local env:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `ENCRYPTION_KEY`

Optional for deeper testing:
- Stripe keys
- Dokploy keys

## Current Dev Reality

The branch currently contains meaningful in-progress work around:
- workspace-first shell
- typed pages
- lightweight databases
- workspace files

The latest workspace-files migration exists in code, but local apply can fail if your `.env` still points to an unreachable remote Postgres instead of local dev Postgres.

If migration apply fails, check `DATABASE_URL` first before blaming Prisma.

## Change Protocol

For every real change:
1. read the relevant docs/code first
2. implement the smallest meaningful slice
3. test it
4. update the docs + `ADHD.md`
5. `git add`, `git commit`, `git push`

## Database Changes

```bash
# edit schema
# create a new migration, do not rewrite applied history
npx prisma migrate dev --name describe_change

# if needed
npx prisma generate
```

Rule: if an old migration is already applied, add a new migration instead of mutating history.

## Testing Expectations

Default checks by scope:
- small behavior change: targeted verification
- API/data change: `npm run test:run`
- launch-critical or user-facing flow change: tests + `npm run build`
- core browser flow changes: targeted Playwright or broader E2E pass

## Current Verified State

Latest known good on this branch:
- `npm run test:run` passing
- `npm run build` passing
- targeted Playwright auth/onboarding/settings slice was previously realigned and verified green

## Local Debug Notes

Common failure classes:
- wrong `DATABASE_URL`
- stale `.next` artifacts affecting build confidence
- stale Playwright expectations that no longer match real UX
- docs claiming older onboarding or route truth

Fix the truth drift, not just the symptom.
