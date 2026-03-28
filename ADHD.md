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
- [x] Deploy frontend to Dokploy (instead of Cloud Run)
- [x] Deploy PostgreSQL to Dokploy (instead of Cloud SQL)
- [x] Delete old Cloud Run + Cloud SQL (saves ~$25/mo)
- [ ] Configure Stripe webhook in production
- [ ] Test full user signup → provision flow
- [ ] Wire up actual chat API to OpenClaw gateway

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
| Hosting | Dokploy on GCP VM |

---

## 🔧 Systems & Infra
- **Repo:** `github.com/mtldev-dotcom/clawhost`
- **Local:** `localhost:3000`
- **Production:** `https://nestai.nickybruno.com`
- **Dokploy Panel:** `http://34.121.34.198:3000`
- **Deploy:** Dokploy (frontend + DB + user instances)
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

---

## ⚠️ Watch Out
- Next.js 15 + next-auth has prerender bug on error pages (build warnings OK)
- Need `AUTH_TRUST_HOST=true` for NextAuth in production
- Brand: Emerald accent **once per screen max** — no decorative use
- Auth flow: Middleware protects `/dashboard` + `/onboarding`, uses JWT strategy
- Session stored in `authjs.session-token` cookie
- Layouts: Root layout has NO nav, public pages use PublicNav, dashboard uses DashboardHeader
- Middleware must be in `src/middleware.ts` (not project root) for src/app structure

---

## 🗒️ Nick's Notes
> 2026-03-27: Automated testing setup complete. Vitest for unit/integration (34 tests), Playwright for E2E. Tests cover: auth flows, instance API, skills API, onboarding wizard, dashboard navigation. Run `npm test` for unit tests, `npm run test:e2e` for E2E.

> 2026-03-27: Auth/Layout refactor + provisioning flow review. Fixed: double header, middleware location (must be in src/), onboarding error handling, provision API now sets status='provisioning'. Flow: register → auto-login → onboarding → PATCH instance → POST provision → redirect to settings.

> 2026-03-28: Deployed to Dokploy via API. PostgreSQL + Next.js app live at nestai.nickybruno.com. Deleted Cloud Run + Cloud SQL. Next: configure Stripe webhook URL and test full flow.

> 2026-03-27: NestAI brand system implemented. Plan to consolidate on Dokploy: deploy frontend + PostgreSQL there instead of Cloud Run + Cloud SQL. Saves ~$25/mo. Next session: set up Dokploy project with DB + app.
