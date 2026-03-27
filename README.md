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

# Start PostgreSQL
npm run db:up

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

See [.env.example](.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) |
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
3. **Onboard** - Choose channel + AI provider, enter tokens
4. **Deploy** - Instance provisioned automatically
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

- [Contributing](docs/CONTRIBUTING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)
- [Deployment (Dokploy)](docs/DEPLOYMENT.md)
- [Deployment (GCP)](docs/DEPLOYMENT_GCP.md)

## Known Issues

- **Production Build**: Next.js 15 has a [known bug](https://github.com/vercel/next.js/issues/56481) with next-auth that causes error page prerendering to fail. Development mode works correctly. Workaround: deploy with `next start` after building with errors ignored, or wait for upstream fix.

## License

MIT

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.
