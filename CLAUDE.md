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
- **Security critical:** Never pass user input directly to shell commands (use array args with `spawn()`)

### New/Updated Libraries (Post-Security Review)
- `src/lib/crypto.ts` - AES-256-GCM encryption for API keys at rest
- `src/lib/rate-limit.ts` - Rate limiting for auth and provisioning endpoints
- `src/lib/dokploy.ts` - Now uses spawn() with validation to prevent shell injection
- `SECURITY_FIXES.md` - Summary of security hardening (move to docs/SECURITY_FIXES.md)

### Key Files
```
clawhost/
├── CLAUDE.md                        ← you are here
├── docs/
│   ├── SECURITY_FIXES.md            ← NEW: Security hardening documentation
│   └── ...
├── src/
│   ├── lib/
│   │   ├── env.ts                   ← UPDATED: Added ENCRYPTION_KEY
│   │   ├── crypto.ts                ← NEW: AES-256-GCM encryption module
│   │   ├── rate-limit.ts            ← NEW: Rate limiting module
│   │   ├── dokploy.ts               ← UPDATED: Shell injection protection
│   │   ├── prisma.ts                ← UPDATED: Conditional query logging
│   │   └── ...
│   └── ...
```

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

### 2026-03-30 — Security Hardening Complete ✅
- **Deep Codebase Analysis & Security Review**
  - Identified 5 critical vulnerabilities and architectural issues
  - Security score improved from ~5/10 to ~7.5/10
- **Implemented P0 Critical Fixes:**
  1. ✅ Disabled Prisma query logging in production (`src/lib/prisma.ts`)
  2. ✅ Fixed shell injection vulnerabilities in `src/lib/dokploy.ts`
     - Replaced `exec()` with `spawn()` using array arguments
     - Added input validators: `validateContainerName()`, `validateCommandArg()`, `validatePairingCode()`
     - Added `escapeEnvVar()` for YAML injection protection
  3. ✅ Added server-side password validation (`src/app/api/auth/register/route.ts`)
     - Min 8 chars, max 128, requires uppercase + lowercase + digit
     - Timing attack protection (same error for existing emails)
  4. ✅ Implemented rate limiting (`src/lib/rate-limit.ts`)
     - Auth: 10 requests per 15 minutes per IP
     - Provisioning: 5 requests per hour per user
  5. ✅ Created API key encryption module (`src/lib/crypto.ts`)
     - AES-256-GCM with scrypt key derivation
  6. ✅ Extracted hardcoded values to environment variables
     - `ENCRYPTION_KEY`, `GCP_PROJECT_ID`, `GCP_ZONE`, `RATE_LIMIT_*`
- **New Files Created:**
  - `src/lib/crypto.ts` - Encryption/decryption utilities
  - `src/lib/rate-limit.ts` - Rate limiting module
  - `docs/SECURITY_FIXES.md` - Comprehensive security documentation
- **Updated Files:**
  - `src/lib/prisma.ts`, `src/lib/env.ts`, `src/lib/dokploy.ts`
  - `src/app/api/auth/register/route.ts`, `src/app/api/provision/route.ts`
  - `.env.example` - Added all new required environment variables
- **Environment Changes Required:**
  - Added `ENCRYPTION_KEY` (generate with `openssl rand -base64 32`)
  - Added `GCP_PROJECT_ID=clawdbot-nickdevmtl`
  - Added `GCP_ZONE=us-central1-a`
  - Added `RATE_LIMIT_AUTH=10_15` and `RATE_LIMIT_API=100_15`
- **Documentation:**
  - Created `SECURITY_FIXES.md` with migration guide
  - Updated `CLAUDE.md` with security execution rules
  - Added security regression test examples

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
