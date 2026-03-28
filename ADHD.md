# ⚡ NestAI — ADHD.md
> *Last updated: 2026-03-27*

---

## 🧠 What Is This?
Multi-tenant SaaS that gives users a hosted AI agent instance with custom subdomain, channels, and skills marketplace.

---

## ✅ What It Does (Right Now)
- User registration + Stripe subscription ($9/mo)
- Auto-provisions OpenClaw instance via Dokploy
- Custom subdomain per user (user.nestai.app)
- AI provider config (OpenAI/Anthropic/OpenRouter)
- Channel setup (Telegram/Discord/WhatsApp)
- Skills marketplace with MCP integrations
- Bilingual UI (EN/FR)
- NestAI brand system (Geist font, ink/chalk/emerald palette)

---

## 🚀 What It Will Do
- [ ] Configure Stripe webhook in production
- [ ] Test full user signup → provision flow on GCP
- [ ] Fix OpenClaw dashboard URL for remote access
- [ ] Wire up actual chat API to OpenClaw gateway
- [ ] Skills MCP server injection into running instances

---

## 🎯 What We Want
> One-click AI agent hosting. User pays, picks their channels and API keys, gets a live agent in seconds. Extend it with marketplace skills. No devops required.

---

## 🏗️ How It's Built
| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), Tailwind, shadcn/ui |
| Backend | Next.js API routes, Server Actions |
| DB | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Auth.js) |
| Payments | Stripe Subscriptions |
| Provisioning | Dokploy REST API |
| i18n | next-intl |
| Hosting | GCP Cloud Run + Cloud SQL |

---

## 🔧 Systems & Infra
- **Repo:** `github.com/mtldev-dotcom/clawhost`
- **Local:** `localhost:3000`
- **Prod:** `https://clawhost-794442866411.us-central1.run.app`
- **Dokploy:** `http://34.121.34.198:3000`
- **Cloud SQL:** `35.225.217.179`
- **Deploy:** Docker → Artifact Registry → Cloud Run
- **Env:** `.env.local` — `DATABASE_URL`, `NEXTAUTH_SECRET`, `STRIPE_*`, `DOKPLOY_*`

---

## 💻 Code Patterns
- **Folder structure:** `src/app/` (routes), `src/components/` (UI), `src/lib/` (utils)
- **State:** Server Components + Server Actions, minimal client state
- **API style:** REST routes in `/api/`, Server Actions for mutations
- **Key conventions:** `use server` for actions, Prisma for DB, Zod for validation

---

## 🔌 APIs & Integrations
| Service | What For | Key |
|---------|----------|-----|
| Stripe | Subscriptions + webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Dokploy | Instance provisioning | `DOKPLOY_URL`, `DOKPLOY_API_KEY` |
| NextAuth | Auth sessions | `NEXTAUTH_SECRET` |
| Cloud SQL | PostgreSQL | `DATABASE_URL` (unix socket) |

---

## ⚠️ Watch Out
- Next.js 15 + next-auth has prerender bug on error pages (build warnings OK)
- Cloud Run needs `AUTH_TRUST_HOST=true` for NextAuth
- DATABASE_URL format different for local (TCP) vs Cloud Run (unix socket)
- Dokploy API key from Profile Settings → API/CLI Section
- Brand: Emerald accent **once per screen max** — no decorative use

---

## 🗒️ Nick's Notes
> 2026-03-27: GCP deployment complete. Dokploy VM running. Test Stripe keys added. NestAI brand system implemented with Geist font, ink/chalk/emerald palette. Next up: configure webhook in Stripe dashboard, then test full flow.
