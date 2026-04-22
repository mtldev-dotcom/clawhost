# Deployment Guide

This file describes the **current deployment truth**.

## Current Hosting Model

ClawHost is designed around:
- the main Next.js app
- PostgreSQL
- Dokploy-managed hosted runtimes for user agents

The active product direction is **not** Cloud Run first. Old GCP-era deployment docs were archived because they are no longer the main truth source.

## Required Runtime Inputs

Core env:
- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV=production`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ENCRYPTION_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `DOKPLOY_URL`
- `DOKPLOY_API_KEY`

## Current Important Storage Truth

Current Dokploy compose truth in code mounts:
- `openclaw_data:/app/data`

That means docs should align storage-related claims to `/app/data`-based runtime behavior unless the compose definition is changed.

## Production Checklist

1. deploy app with correct env
2. ensure DB is reachable
3. run Prisma deploy migrations
4. seed required reference data if needed
5. verify Stripe webhook path
6. verify Dokploy API connectivity
7. verify provisioning path with a safe test account
8. verify workspace shell and settings after login

## Reality Check

The app can build and core tests pass, but the full payment → provisioning proof still needs live validation.
Deployment docs must not overclaim beyond that.

## Archived Deployment Docs

Legacy deployment variants live under:
- `docs/archive/2026-04-22-legacy/`

Use them only as historical reference.
