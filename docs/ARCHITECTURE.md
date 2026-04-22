# Architecture

## Source of Truth Rule

This file is the architecture truth source for ClawHost.

When product flow, service boundaries, or runtime behavior changes, update this file in the same work.
Also keep `AGENTS.md`, `docs/WORKFLOW.md`, `docs/DEVELOPMENT.md`, `ADHD.md`, and the Clawhost Notion project page aligned.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ClawHost Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Next.js │    │ Postgres │    │  Stripe  │    │ Dokploy  │  │
│  │   App    │───▶│ (Prisma) │    │   API    │    │   API    │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                              │                │         │
│       │         ┌────────────────────┘                │         │
│       │         │                                     │         │
│       ▼         ▼                                     ▼         │
│  ┌─────────────────┐                        ┌─────────────────┐ │
│  │   Webhook       │                        │   Provisioner   │ │
│  │   Handler       │───────────────────────▶│   Service       │ │
│  └─────────────────┘                        └─────────────────┘ │
│                                                     │           │
└─────────────────────────────────────────────────────┼───────────┘
                                                      │
                                                      ▼
                              ┌─────────────────────────────────┐
                              │      Dokploy (Hetzner VPS)      │
                              ├─────────────────────────────────┤
                              │  ┌─────────┐  ┌─────────┐       │
                              │  │OpenClaw │  │OpenClaw │  ...  │
                              │  │ user-a  │  │ user-b  │       │
                              │  └─────────┘  └─────────┘       │
                              └─────────────────────────────────┘
```

## Core Components

### 1. Next.js Application

The main web application handling:
- User authentication (NextAuth v5)
- Dashboard UI (Chat, Settings, Skills pages)
- API routes
- Server actions
- Internationalization (English/French via next-intl)

**Key files:**
- `src/lib/auth.ts` - Authentication configuration
- `src/app/` - Pages and API routes
- `src/i18n/` - Translations and locale configuration

### 2. Database (PostgreSQL + Prisma)

Stores all application data:

**Models:**
- `User` - Account info, Stripe customer ID, locale preference
- `Instance` - Provisioned OpenClaw instances, active model, agent locale
- `ProviderConfig` - Multiple AI provider API keys per instance
- `Skill` - Available MCP integrations
- `Account/Session` - NextAuth tables

**Key files:**
- `prisma/schema.prisma` - Schema definition
- `src/lib/prisma.ts` - Client singleton

### 3. Stripe Integration

Handles payments and subscriptions:

**Flow:**
1. User clicks "Subscribe" → Create checkout session
2. User completes payment → Webhook receives `checkout.session.completed`
3. Webhook creates Instance record with `status: provisioning`
4. Webhook triggers async provisioning

**Key files:**
- `src/lib/stripe.ts` - Stripe client
- `src/app/api/stripe/checkout/route.ts` - Checkout creation
- `src/app/api/stripe/webhook/route.ts` - Event handling

### 4. Dokploy Provisioner

Manages OpenClaw instances on Dokploy:

**Provisioning steps:**
1. Create project in Dokploy
2. Create Docker Compose service
3. Set compose file with env vars
4. Add domain (Traefik handles SSL)
5. Deploy
6. Update DB with URLs

**Key files:**
- `src/lib/dokploy.ts` - All Dokploy API calls

## Data Flow

### User Registration
```
Browser → /api/auth/register → Password policy validation → Hash password → Create User → Return success
```

### Current Local Onboarding Shape
```
Login/Register → /onboarding
    ↓
Choose AI provider + submit API key test
    ↓
Choose active model
    ↓
Save instance config via /api/instance
    ↓
Trigger /api/provision
    ↓
Redirect to /chat
```

Note: older tests still assumed a channel-first onboarding wizard. The current UI is provider-first, so any onboarding/dashboard changes must keep tests and docs in sync.

### Subscription Flow (target launch path)
```
Landing/Dashboard → /api/stripe/checkout → Stripe Checkout → Payment
    ↓
Stripe Webhook → /api/stripe/webhook → Create/advance Instance → Provision
    ↓
Dokploy API → Create Project → Deploy Container → Update DB → Chat/dashboard ready
```

### Skill Activation
```
Skills Page → /api/skills (POST) → Update enabledSkills → Redeploy or refresh Instance config
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT sessions (no server-side session storage)
- Middleware protects routes with `auth()` checks
- Server-side password validation enforced (8+ chars, upper/lower/digit required)

### API Security
- All mutations require authentication via `auth()` before processing
- Stripe webhooks verified with signature validation
- Environment variables validated at runtime via Zod schema
- Rate limiting on sensitive endpoints:
  - Auth: 10 requests per 15 minutes per IP
  - Provisioning: 5 requests per hour per user
- Returns sanitized error messages (no internal details leaked)

### Secrets Management
- API keys stored in environment variables
- User AI API keys (OpenAI, Anthropic, etc.) encrypted at rest using AES-256-GCM
- Encryption key derived via scrypt from `ENCRYPTION_KEY` env var
- Masked keys shown in logs (`sk-...XXXX`)
- Hardcoded values extracted to environment variables

### Shell Command Security
- All Docker commands use `spawn()` with array arguments (not string interpolation)
- Input validation for:
  - Container names: alphanumeric + hyphens only
  - Command arguments: strict allowlist pattern
  - Pairing codes: alphanumeric, 4-32 characters
  - Environment variables: newline/null byte removal
- No shell injection vulnerabilities

### Infrastructure Security
- Prisma query logging disabled in production
- GCP project/zone configurable via environment variables
- Docker socket mount required for production provisioning

## Scaling Considerations

### Current Architecture
- Single Next.js instance
- Single PostgreSQL database
- Dokploy manages container orchestration
- Documentation + Notion planning are part of delivery, not optional side work

### Future Scaling
- Add Redis for session caching
- Database read replicas
- Multiple Dokploy nodes for instance distribution
- Queue system for async provisioning (Bull/BullMQ)

## Error Handling

### Provisioning Failures
- Instance status set to `failed`
- User notified via dashboard
- Manual retry available via `/api/provision`

### Webhook Failures
- Stripe retries automatically
- Idempotent handlers (upsert operations)
- Logging for debugging

## Monitoring (Future)

Recommended additions:
- Sentry for error tracking
- Prometheus metrics
- Dokploy health checks
- Uptime monitoring for user instances
