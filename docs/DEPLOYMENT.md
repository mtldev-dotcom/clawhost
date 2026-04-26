# Deployment Guide

This file describes the **current deployment truth** for ClawHost on Dokploy.

---

## Stack

| Component | Where |
|-----------|-------|
| Next.js app | Dokploy (Docker, standalone output) |
| PostgreSQL | Dokploy (separate service) |
| OpenClaw instances | Dokploy (one compose per user, auto-provisioned) |

---

## Required Environment Variables

### App

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Full public HTTPS URL, e.g. `https://app.clawhost.com` |
| `NODE_ENV` | `production` |

### Database

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |

### Auth

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random secret (32+ chars) |
| `AUTH_SECRET` | Same value as `NEXTAUTH_SECRET` (next-auth v5 requires both) |
| `NEXTAUTH_URL` | Same as `NEXT_PUBLIC_APP_URL` |
| `AUTH_TRUST_HOST` | `true` (required behind reverse proxy) |

### Encryption

| Variable | Description |
|----------|-------------|
| `ENCRYPTION_KEY` | 32-byte secret — `openssl rand -base64 32` |

### Platform AI (OpenRouter)

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key — all workspace AI calls use this |
| `PLATFORM_DEFAULT_MODEL` | Default model ID (default: `openrouter/nvidia/nemotron-3-super-120b-a12b:free`) |
| `PLATFORM_MONTHLY_CREDITS` | Credits granted per subscription cycle (default: `1000`) |

### Stripe

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Starts with `sk_` |
| `STRIPE_WEBHOOK_SECRET` | Starts with `whsec_` |
| `STRIPE_PRICE_ID` | Starts with `price_` |

### Dokploy (OpenClaw provisioning)

| Variable | Description |
|----------|-------------|
| `DOKPLOY_URL` | Dokploy panel URL, e.g. `http://35.202.32.236:3000` |
| `DOKPLOY_API_KEY` | Dokploy API key |

---

## Telegram

No platform-level Telegram env vars needed. Each user configures their own bot via Settings:
1. User creates a bot with `@BotFather` → pastes token + their Telegram ID
2. App stores token (encrypted) and auto-registers the Telegram webhook pointing to `{NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
3. User messages their bot → routed to their OpenClaw instance

**Webhook registration only fires when `NEXT_PUBLIC_APP_URL` starts with `https`** — correct in production, skipped in local dev.

---

## Deploy Steps

### First deploy

```bash
# 1. Set all env vars in Dokploy

# 2. Run migrations (run once on the Next.js container)
npx prisma migrate deploy

# 3. Seed (optional — creates default data)
npx prisma db seed
```

### Subsequent deploys

Dokploy rebuilds the container on push. Migrations run automatically via:
```bash
npx prisma migrate deploy
```
Add this as a pre-start command in your Dokploy compose or entrypoint.

---

## Production Checklist

- [ ] All env vars set in Dokploy
- [ ] `NEXT_PUBLIC_APP_URL` is HTTPS
- [ ] `AUTH_TRUST_HOST=true` set
- [ ] `AUTH_SECRET` and `NEXTAUTH_SECRET` both set to the same value
- [ ] `npx prisma migrate deploy` has run
- [ ] `/status` page returns `✓ Operational` for both App and Database
- [ ] Stripe webhook endpoint configured: `{NEXT_PUBLIC_APP_URL}/api/stripe/webhook`
- [ ] Stripe webhook secret matches `STRIPE_WEBHOOK_SECRET`
- [ ] Test full signup → onboarding → workspace flow
- [ ] Test Settings → Deploy runtime (requires active subscription + credits)
- [ ] Test Settings → Telegram bot setup end to end

---

## Reality Check

The app builds and all unit/integration tests pass. The full payment → provisioning → Telegram proof still needs live validation on the production Dokploy environment.
