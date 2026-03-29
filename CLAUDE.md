# ClawHost — Claude Code Orchestration Guide

## Project Overview
ClawHost is a multi-tenant SaaS platform that lets users subscribe and instantly get a hosted OpenClaw agent instance with a custom subdomain (user-a.nickybruno.com), channels (Telegram/Discord/WhatsApp), and API key management.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (Auth.js)
- **Payments**: Stripe (subscriptions + webhooks)
- **Provisioning**: Dokploy REST API (production) / Local Docker (development)
- **Styling**: Tailwind CSS + shadcn/ui
- **i18n**: next-intl (English/French)
- **Local Dev**: Docker Compose (Postgres + OpenClaw containers)
- **Deployment**: GCP VM via Dokploy

## Build Instructions for Claude Code

### Step 1 — Spawn Sub-Agents
Use parallel sub-agents for these independent tracks:
1. **agent:db** → Schema + Prisma migrations (see `docs/AGENT_DB.md`)
2. **agent:auth** → NextAuth setup + login/register pages (see `docs/AGENT_AUTH.md`)
3. **agent:stripe** → Stripe products + webhook handler (see `docs/AGENT_STRIPE.md`)
4. **agent:provisioner** → Dokploy API service + provision endpoint (see `docs/AGENT_PROVISIONER.md`)
5. **agent:dashboard** → User dashboard UI (see `docs/AGENT_DASHBOARD.md`)
6. **agent:skills** → Phase 2 skills marketplace (see `docs/AGENT_SKILLS.md`)

### Step 2 — Integration Order (sequential after sub-agents complete)
1. Wire Stripe webhook → provisioner
2. Wire provisioner → DB instance record
3. Wire dashboard → DB instance status
4. Run `prisma migrate dev` and seed
5. Run `npm run dev` and verify full flow

### Execution Rules
- **NEVER stop to ask questions** unless a secret/credential is needed that isn't in `.env.example`
- Make decisions autonomously using the patterns defined in each agent doc
- If a dep is missing, install it — don't ask
- Prefer server actions and API routes over client fetches where possible
- All env vars must be read from `process.env` with validation via `src/lib/env.ts`
- Use `src/lib/dokploy.ts` as the single source for all Dokploy API calls
- Use `src/lib/stripe.ts` as the single source for Stripe calls

### Key Files
```
clawhost/
├── CLAUDE.md                        ← you are here
├── .claude/
│   ├── settings.json
│   └── commands/
│       ├── provision.md
│       └── deprovision.md
├── docs/
│   ├── AGENT_DB.md
│   ├── AGENT_AUTH.md
│   ├── AGENT_STRIPE.md
│   ├── AGENT_PROVISIONER.md
│   ├── AGENT_DASHBOARD.md
│   └── AGENT_SKILLS.md
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 ← landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           ← header with nav + language switcher
│   │   │   ├── page.tsx             ← chat interface (home)
│   │   │   ├── settings/            ← providers + channel config
│   │   │   └── skills/              ← skills marketplace
│   │   ├── onboarding/
│   │   │   └── page.tsx             ← post-payment setup wizard
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   └── webhook/route.ts
│   │       ├── provision/
│   │       │   └── route.ts
│   │       ├── user/locale/route.ts ← save user language preference
│   │       └── skills/
│   │           └── route.ts
│   ├── i18n/
│   │   ├── config.ts                ← locale definitions
│   │   ├── request.ts               ← next-intl request handler
│   │   └── messages/
│   │       ├── en.json              ← English translations
│   │       └── fr.json              ← French translations
│   ├── lib/
│   │   ├── env.ts                   ← zod env validation
│   │   ├── prisma.ts
│   │   ├── stripe.ts
│   │   ├── dokploy.ts               ← Dokploy + local Docker provisioning
│   │   └── auth.ts
│   ├── types/
│   │   └── index.ts
│   └── components/
│       ├── ui/                      ← shadcn components
│       ├── LanguageSwitcher.tsx     ← EN/FR toggle
│       └── dashboard/
│           ├── DashboardHeader.tsx
│           ├── ChatInterface.tsx
│           └── SkillCard.tsx
├── scripts/
│   └── reset-users.ts               ← npm run db:reset-users
├── docker-compose.dev.yml           ← local postgres
├── .env.example
├── .env.local                       ← NEVER commit
└── package.json
```

### Local Dev Setup
```bash
npm install
npx prisma db push   # sync schema to GCP postgres
npm run dev
```

### Alternative: Local Postgres
```bash
docker compose -f docker-compose.dev.yml up -d   # start local postgres
# Update DATABASE_URL in .env to localhost:5432
npx prisma migrate dev
npm run dev
```

### When You Need the Human
Only pause and ask Nick if:
1. A Stripe product/price ID needs to be manually created in the dashboard
2. Dokploy API key is not yet in `.env.local`
3. OpenClaw Docker image name is unclear (default: `ghcr.io/openclaw/openclaw:latest`)

## Session Notes

### 2026-03-29
- Fixed database connection: port is `5422` (not 5432), added GCP firewall rule
- Fixed Dokploy server IP in `webServerSettings` table (was showing old IP)
- Fixed `package-lock.json` sync issues, Dockerfile now uses `npm install` instead of `npm ci`
- Added `npm run db:reset-users` script to clear all users/instances
- Fixed pairing approval: auto-detects local vs production environment
  - **Production**: requires Docker socket mount (`/var/run/docker.sock:/var/run/docker.sock`)
  - **Local dev**: uses `gcloud ssh` to execute commands
- Database connection: `postgresql://clawhost:***@35.202.32.236:5422/nestai-db`

### 2026-03-28
- Fixed OpenClaw provisioning: `sourceType: "raw"` for inline compose, correct env vars (`TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`)
- Redesigned onboarding: 5-step flow with API key validation and Telegram pairing
- Added `/api/onboarding/test-provider` and `/api/onboarding/approve-pairing` endpoints
- Added pairing code UI to settings page for existing users
- Upgraded GCP VM to e2-standard-2 (8GB RAM) due to memory crashes
- **New IP: 35.202.32.236** - DNS updates needed:
  - `*.nickybruno.com` → `35.202.32.236` (user subdomains)
  - `dok.nestai.nickybruno.com` → `35.202.32.236` (Dokploy panel)
- Database now at `35.202.32.236:5422/nestai-db`
- Dokploy at `http://35.202.32.236:3000`

### 2026-03-27
- Added Dokploy API response compatibility handling in `src/lib/dokploy.ts`
- Added parser helpers in `src/lib/dokploy-api.ts` and regression coverage
- Set up automated testing infrastructure (Vitest + Playwright)
- Fixed auth/layout issues (double header, middleware location)
