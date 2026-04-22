# ClawHost

Multi-tenant SaaS platform for hosting personal AI agent instances. Users subscribe, get a custom subdomain, connect messaging channels (Telegram/Discord/WhatsApp), and extend their agent with skills from the marketplace.

## Features

- **Instant Provisioning** - Hosted OpenClaw instances deployed via Dokploy
- **Custom Subdomains** - Each user gets `username.nickybruno.com`
- **Channel Integration** - Connect Telegram, Discord, or WhatsApp
- **AI Provider Choice** - Bring your own OpenAI, Anthropic, or OpenRouter key
- **Multi-Provider Support** - Save multiple API keys and switch between models
- **Skills Marketplace** - Extend your agent with MCP-based integrations (Gmail, Calendar, Notion, GitHub, etc.)
- **Bilingual UI** - Full English and French support with language switcher
- **Stripe Subscriptions** - $9/month with automatic provisioning on payment

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Auth.js) |
| Payments | Stripe Subscriptions |
| Provisioning | Dokploy REST API / Local Docker |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (English/French) |
| Deployment | Hetzner VPS via Dokploy |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Stripe CLI (for webhook testing)
- PostgreSQL (or use Docker)

### Setup

```bash
# Clone the repo
git clone https://github.com/mtldev-dotcom/clawhost.git
cd clawhost

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values
# Important: keep local dev pointed at localhost, not the production DB/app URLs

# Start PostgreSQL
npm run db:up

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start development server
npm run dev

# Run checks
npm run lint
npm run test:run
```

### Environment Variables

See [.env.example](.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) |
| `NEXT_PUBLIC_APP_URL` | Public app URL (http://localhost:3000) |
| `ENCRYPTION_KEY` | 32-byte secret for encrypting stored provider keys |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (whsec_...) |
| `STRIPE_PRICE_ID` | Stripe price ID for subscription |
| `DOKPLOY_URL` | Dokploy instance URL |
| `DOKPLOY_API_KEY` | Dokploy API key |

### Stripe Webhook Testing

```bash
# In a separate terminal
npm run stripe:listen
# Copy the webhook secret to .env.local
```

## Verified Local Dev Status

As of 2026-04-21, this repo was verified locally with:

- `npm install`
- local PostgreSQL via `docker compose -f docker-compose.dev.yml up -d`
- Prisma migrations + seed against local DB
- dev server at `http://localhost:3000`
- smoke-checked routes: `/`, `/register`, `/login`
- registration API verified with:
  - strong password succeeds
  - weak password fails with requirement details

Current verified checks:

- `npm run test:run` -> 35/35 tests passing
- `npx playwright test tests/e2e/auth/signup.spec.ts --project=chromium` -> 5/5 passing
- `npm run test:e2e` -> 11/20 passing, 9 failing
- `npm run build` -> succeeds with NextAuth/Edge runtime warnings
- `npm run lint` -> passes with warnings only

Main current gap: the onboarding/dashboard E2E tests are stale versus the current provider-first onboarding UI, so the launch-critical flow still needs revalidation against the real product behavior.

## Governance and Truth Sources

This repo now treats docs and planning as part of the product, not extras.

Truth sources that must stay aligned:

- `AGENTS.md` for repo operating rules
- `docs/ARCHITECTURE.md` for system design and real flow shape
- `docs/WORKFLOW.md` for coding protocol and delivery pipeline
- `docs/DEVELOPMENT.md` and `docs/LOCAL_TESTING_GUIDE.md` for local dev truth
- `ADHD.md` for short current-state progress notes
- Notion project page + launch tasks for planning and execution tracking

If code changes but these stay stale, the repo is lying.

## Project Structure

```
clawhost/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Skills seed data
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login/Register pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # User dashboard (Chat, Settings, Skills)
│   │   └── onboarding/    # Post-payment setup
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   └── dashboard/     # Dashboard components
│   ├── i18n/
│   │   ├── config.ts      # Locale configuration
│   │   ├── request.ts     # next-intl request handler
│   │   └── messages/      # en.json, fr.json
│   └── lib/
│       ├── auth.ts        # NextAuth config
│       ├── prisma.ts      # Prisma client
│       ├── stripe.ts      # Stripe client
│       └── dokploy.ts     # Dokploy/Docker provisioning
├── docs/                  # Documentation
└── CLAUDE.md              # Claude Code instructions
```

## User Flow

1. **Register** - Create account with email/password
2. **Subscribe** - Stripe checkout for $9/month
3. **Onboard** - Configure provider credentials in the current onboarding flow
4. **Deploy** - Instance is configured/provisioned and routed to chat/dashboard
5. **Extend** - Add skills from marketplace

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | * | NextAuth handlers |
| `/api/auth/register` | POST | User registration |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe events |
| `/api/provision` | POST | Trigger instance provisioning |
| `/api/instance` | GET/PATCH | Get/update instance config |
| `/api/skills` | GET/POST | List skills / toggle skill |

## Documentation

- [AGENTS contract](AGENTS.md)
- [Workflow](docs/WORKFLOW.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)
- [Local testing guide](docs/LOCAL_TESTING_GUIDE.md)
- [Deployment (Dokploy)](docs/DEPLOYMENT.md)
- [Deployment (GCP)](docs/DEPLOYMENT_GCP.md)

## Known Issues

- **Production Build**: Next.js 15 has a [known bug](https://github.com/vercel/next.js/issues/56481) with next-auth that causes error page prerendering to fail. Development mode works correctly. Workaround: deploy with `next start` after building with errors ignored, or wait for upstream fix.

## License

MIT

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.
