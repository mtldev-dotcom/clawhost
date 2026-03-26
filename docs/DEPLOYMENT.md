# Deployment Guide

## Overview

ClawHost is designed to run on a Hetzner VPS managed by Dokploy. The main app and user instances all run on the same infrastructure.

## Prerequisites

- Hetzner VPS (or similar) with Docker
- Dokploy installed and configured
- Domain with DNS access
- Stripe account with products configured
- PostgreSQL database (can run on same VPS)

## Production Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=https://clawhost.nickybruno.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/clawhost

# Auth
NEXTAUTH_SECRET=<generate-secure-secret>
NEXTAUTH_URL=https://clawhost.nickybruno.com

# Stripe (production keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Dokploy
DOKPLOY_URL=https://deploy.nickybruno.com
DOKPLOY_API_KEY=<your-dokploy-api-key>
```

## Deployment Steps

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb clawhost

# Run migrations
DATABASE_URL=<prod-url> npx prisma migrate deploy

# Seed skills data
DATABASE_URL=<prod-url> npm run db:seed
```

### 2. Stripe Configuration

1. Create a product in Stripe Dashboard
2. Create a price ($9/month recurring)
3. Copy the price ID to `STRIPE_PRICE_ID`
4. Create webhook endpoint pointing to `/api/stripe/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.deleted`
6. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Dokploy Setup

1. Access Dokploy dashboard
2. Create API key for ClawHost
3. Note the base URL and API key
4. Ensure `dokploy-network` exists for container networking

### 4. Deploy Application

#### Option A: Dokploy (Recommended)

1. Create new project in Dokploy
2. Add application from Git repository
3. Set environment variables
4. Configure domain
5. Deploy

#### Option B: Docker Compose

```yaml
version: '3.8'
services:
  clawhost:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      # ... other env vars
    networks:
      - dokploy-network

networks:
  dokploy-network:
    external: true
```

#### Option C: Manual

```bash
# Build
npm run build

# Start (with process manager)
pm2 start npm --name clawhost -- start
```

### 5. DNS Configuration

```
# Main app
clawhost.nickybruno.com → VPS IP

# Wildcard for user instances
*.nickybruno.com → VPS IP
```

### 6. SSL Certificates

Dokploy/Traefik handles SSL automatically via Let's Encrypt.

Ensure:
- Port 80 open for ACME challenges
- Port 443 open for HTTPS
- Wildcard certificate configured for `*.nickybruno.com`

## Post-Deployment

### Verify Deployment

1. Access https://clawhost.nickybruno.com
2. Register a test account
3. Complete Stripe checkout (test mode first)
4. Verify instance provisioning
5. Check user instance is accessible

### Monitoring

Set up monitoring for:
- Main application uptime
- Database connections
- Stripe webhook delivery
- Dokploy API availability

### Backup Strategy

```bash
# Database backup (daily cron)
pg_dump clawhost > backup-$(date +%Y%m%d).sql

# Store backups off-site
```

## Troubleshooting

### Build Fails

The Next.js 15 + next-auth build issue may cause errors. Workarounds:

1. Deploy with dev server (not recommended for production)
2. Use Docker with multi-stage build that ignores errors
3. Wait for upstream fix

### Webhook Not Receiving Events

1. Check Stripe webhook logs
2. Verify endpoint URL is correct
3. Check webhook secret matches
4. Ensure firewall allows Stripe IPs

### Instance Not Provisioning

1. Check Dokploy API connectivity
2. Verify API key permissions
3. Check Dokploy logs for errors
4. Verify `dokploy-network` exists

### Database Connection Issues

1. Check connection string
2. Verify network access (firewall, VPC)
3. Check PostgreSQL logs
4. Verify SSL mode if required

## Scaling

### Horizontal Scaling

For higher load:
1. Run multiple app instances behind load balancer
2. Use connection pooling (PgBouncer)
3. Add Redis for session storage
4. Distribute instances across multiple Dokploy nodes

### Database Scaling

1. Add read replicas
2. Implement connection pooling
3. Consider managed PostgreSQL (Supabase, Neon, RDS)

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] Database not publicly accessible
- [ ] Stripe webhook signature verification enabled
- [ ] Rate limiting on API routes
- [ ] Regular security updates
