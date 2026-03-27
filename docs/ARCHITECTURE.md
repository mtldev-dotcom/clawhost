# Architecture

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
Browser → /api/auth/register → Hash password → Create User → Return success
```

### Subscription Flow
```
Dashboard → /api/stripe/checkout → Stripe Checkout → Payment
    ↓
Stripe Webhook → /api/stripe/webhook → Create Instance → Provision
    ↓
Dokploy API → Create Project → Deploy Container → Update DB
```

### Skill Activation
```
Skills Page → /api/skills (POST) → Update enabledSkills → Redeploy Instance
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT sessions (no server-side session storage)
- Middleware protects routes

### API Security
- All mutations require authentication
- Stripe webhooks verified with signature
- Environment variables validated at runtime

### Secrets Management
- API keys stored in environment variables
- User API keys (AI providers) stored in DB
- Consider encryption at rest for sensitive fields

## Scaling Considerations

### Current Architecture
- Single Next.js instance
- Single PostgreSQL database
- Dokploy manages container orchestration

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
