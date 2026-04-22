# ClawHost

ClawHost is being rebuilt into a workspace-first AI product.

The current direction is:
- **PageBase-style workspace UX** as the product face
- **ClawHost hosted-agent infrastructure** as the backend spine

A user signs up, gets a workspace, creates pages and lightweight databases, starts building a file layer, and then connects chat, skills, billing, and provisioning from the same app.

## Current Product Truth

What is real in code right now:
- authenticated workspace bootstrap with a root Home page
- typed workspace pages: standard, database, board, dashboard, capture
- database page fields, rows, and simple table rendering
- workspace file-system foundation with root folders: Inbox, Projects, Notes
- authenticated workspace file list/upload API
- workspace upload UI
- workspace file download flow
- workspace file search UI
- provider-first onboarding
- dashboard settings for provider/channel configuration
- hosted-agent provisioning via Dokploy
- skills marketplace UI and API
- English/French UI support

What is **not** fully proven yet:
- end-to-end Stripe payment → provisioning in real production conditions
- final canonical post-onboarding route model between workspace/chat/dashboard
- agent MCP hooks into the new workspace file layer
- local Prisma apply for the newest workspace-files migration when the configured remote DB is unreachable

## Verified Checks

Latest verified checks on this branch:
- `npm run test:run` ✅
- `npm run build` ✅

Latest verified targeted browser truth:
- provider-first onboarding is the real flow
- onboarding lands in `/dashboard/workspace`
- logout behavior was revalidated and test drift was fixed
- workspace file upload/download/search surfaces are now in the app shell

## Stack

- Next.js 15 (App Router)
- TypeScript
- PostgreSQL + Prisma
- NextAuth v5
- Stripe
- Dokploy
- Tailwind + shadcn/ui
- next-intl

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

1. Register or sign in
2. Workspace is bootstrapped automatically
3. Onboarding configures provider + model
4. Provisioning configures the hosted runtime
5. User lands in `/dashboard/workspace`
6. Workspace becomes the main shell for pages, databases, and files
7. Chat, settings, skills, billing, and provisioning remain attached to the same account

## API Surface (current key routes)

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/register` | POST | registration |
| `/api/instance` | GET, PATCH | instance config |
| `/api/skills` | GET, POST | list/toggle skills |
| `/api/provision` | POST | provisioning trigger |
| `/api/stripe/checkout` | POST | Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe events |
| `/api/workspace/files` | GET, POST | list/upload workspace files |
| `/api/workspace/files/[id]/download` | GET | download owned workspace file |

## Docs Map

Live docs:
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
