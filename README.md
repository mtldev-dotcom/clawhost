# Foyer

Foyer is a workspace OS, second brain, and AI partner for solo professionals.

Foyer is built for solo professionals — consultants, freelancers, indie pros — who need a single place to think, plan, capture, and act with an AI partner.

## What Foyer does today

- Workspace shell with typed pages (Standard, Database, Board, Dashboard, Capture)
- Database pages with fields, rows, table view
- Workspace file system (Inbox, Projects, Notes) with upload, download, search, soft delete
- Cmd+K AI command palette backed by your workspace context
- Stripe-based subscription with monthly credits
- English and French UI
- Health-check page at /status
- Legal pages (Terms, Privacy)

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind, shadcn |
| Backend | Next.js API routes, Server Actions |
| DB | PostgreSQL + Prisma |
| Auth | NextAuth v5 |
| Payments | Stripe |
| AI | OpenRouter (platform-managed) |
| i18n | next-intl |

## Local Setup

### Prerequisites
- Node.js 18+
- Docker
- Git

### Boot local dev
```bash
git clone https://github.com/mtldev-dotcom/clawhost.git
cd clawhost
npm install
cp .env.example .env.local
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

### Core commands
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
```

## Current App Shape

Foyer works like this:

1. Register or sign in
2. Workspace is bootstrapped automatically
3. Onboarding configures the default platform model
4. Billing activates subscription credits
5. User lands in `/dashboard/workspace`
6. Workspace becomes the main shell for pages, databases, and files
7. Settings handles deploy status, Telegram linking, and model changes

## API Surface

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/register` | POST | registration |
| `/api/instance` | GET, PATCH | instance config |
| `/api/skills` | GET, POST | skills (deprecated, hidden) |
| `/api/stripe/checkout` | POST | Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe events |
| `/api/workspace/files` | GET, POST | list/upload workspace files |
| `/api/workspace/files/[id]/download` | GET | download owned workspace file |
| `/api/ai/command` | POST | AI command palette |
| `/api/status` | GET | health check |

## Docs Map

Live docs:
- `plan-foyer.md` — active build plan (M5+)
- `plan-claude.md` — historical M0–M4 only
- `AGENTS.md` — repo execution contract
- `ADHD.md` — short current-state truth
- `docs/INDEX.md` — docs map
- `docs/ARCHITECTURE.md` — product/system truth
- `docs/WORKFLOW.md` — execution + done rules
- `docs/DEVELOPMENT.md` — local dev truth
- `docs/LOCAL_TESTING_GUIDE.md` — verification truth
- `docs/DEPLOYMENT.md` — current deployment truth
- `docs/ROADMAP.md` — active roadmap
- `docs/CONTRIBUTING.md` — contribution rules
- `SECURITY_FIXES.md` — security status summary

Archived legacy docs live under:
- `docs/archive/2026-04-22-legacy/`

## Repo Rule

If code, tests, docs, and planning disagree, the repo is lying.
Fix the disagreement, not the wording.
