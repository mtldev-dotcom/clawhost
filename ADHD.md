# ⚡ ClawHost — ADHD.md
> *Last updated: 2026-04-22*

---

## 🧠 What Is This?
Merged app in progress: PageBase-style workspace product on top of ClawHost hosted-agent infrastructure.

---

## ✅ What It Does (Right Now)
- User registration + login
- Signed-in users auto-bootstrap into a workspace with a root Home page
- `/dashboard/workspace` is the main product shell
- Onboarding now picks a default platform-managed OpenRouter model, then routes into `/dashboard/workspace`
- Page types are real in the workspace create flow (Standard, Database, Board, Dashboard, Capture)
- Database pages support starter schema fields, row creation, and a simple table view
- Workspace file layer is real with root folders: Inbox, Projects, Notes
- Authenticated `/api/workspace/files` supports list + upload
- Workspace UI supports file upload, download, and search
- Dead dashboard components and legacy onboarding API routes from the old flow are removed
- Stale Playwright specs for the retired channel-first onboarding UI are removed and replaced with current onboarding/workspace smoke coverage
- Settings now reflect the newer product direction: platform-managed LLM access, subscription-credit foundation, and shared Telegram bot linking foundation
- Skills marketplace UI/API exists
- Bilingual UI (EN/FR)
- Chat UI + chat API routes exist in code
- Security hardening landed: rate limiting, crypto helpers, stronger registration password policy
- Local dev now runs on localhost + local Postgres

---

## 🚀 What It Will Do
- [x] Deploy frontend to Dokploy (instead of Cloud Run)
- [x] Deploy PostgreSQL to Dokploy (instead of Cloud SQL)
- [x] Delete old Cloud Run + Cloud SQL (saves ~$25/mo)
- [x] Configure Stripe webhook in production
- [x] Realign the launch-critical auth/onboarding/settings E2E slice with the actual UI
- [x] Pivot onboarding foundation toward platform-managed OpenRouter + subscription credits
- [ ] Test full user signup -> payment -> provision flow end to end
- [ ] Consume shared Telegram bot `/start <token>` and persist account linking
- [ ] Route shared-bot messages into the correct user/runtime
- [ ] Add real credit decrement/metering rules
- [ ] Verify chat flow against a real OpenClaw gateway instance
- [ ] Prove provisioning against a safe live or local runtime
- [ ] Reduce remaining lint warnings and route drift

---

## 🎯 What We Want
> One app. User gets a workspace first, then layers in AI chat, databases, channels, skills, billing, and hosted-agent power without feeling like they entered a second product.

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
- **Local app:** `localhost:3000` (Next.js)
- **Local DB:** Docker PostgreSQL on `localhost:5432` (`nestai-db`)
- **Production:** canonical public hostname still needs final cleanup, do not treat legacy NestAI hostnames as settled product truth
- **Dokploy Panel:** `http://35.202.32.236:3000`
- **Deploy:** Dokploy (frontend + DB + user instances)
- **Env split:** `.env` = local-first repo defaults, `.env.local` = private local overrides/secrets

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
| OpenRouter | Platform-managed LLM access | `OPENROUTER_API_KEY` |
| Stripe | Subscriptions + webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Dokploy | Instance provisioning | `DOKPLOY_URL`, `DOKPLOY_API_KEY` |
| NextAuth | Auth sessions | `NEXTAUTH_SECRET` |
| Telegram | Shared bot linking foundation | `TELEGRAM_SHARED_BOT_USERNAME` |

---

## ⚠️ Watch Out
- Next.js 15 + next-auth has prerender bug on error pages (build warnings OK)
- Need `AUTH_TRUST_HOST=true` for NextAuth in production
- Brand: Emerald accent **once per screen max** — no decorative use
- Auth flow: Middleware protects `/dashboard` + `/onboarding`, uses JWT strategy
- Session stored in `authjs.session-token` cookie
- If you change `NEXTAUTH_SECRET`, old cookies will throw `JWTSessionError` until browser site data is cleared
- If you browse local dev over a Tailscale/LAN IP, `NEXTAUTH_URL` should match the URL you are actually using
- Layouts: Root layout has NO nav, public pages use PublicNav, dashboard uses DashboardHeader
- Middleware must be in `src/middleware.ts` (not project root) for src/app structure

---

## 🧪 Manual Story Flows You Can Test Yourself

### 1. Fresh signup -> onboarding -> workspace
1. Open `/register`
2. Create a new account
3. Confirm redirect to `/onboarding`
4. Pick a default model
5. Continue into `/dashboard/workspace`
6. Confirm a workspace exists and the shell loads

### 2. Login -> workspace
1. Open `/login`
2. Sign in with an existing account
3. Confirm redirect into the authenticated app
4. Confirm `/dashboard/workspace` loads

### 3. Workspace bootstrap truth
1. Open `/dashboard/workspace`
2. Confirm the workspace exists
3. Confirm root folders exist: `Inbox`, `Projects`, `Notes`
4. Confirm the root Home page exists

### 4. Create a standard page
1. Open the workspace page creator
2. Create a `Standard` page
3. Open it
4. Edit title/content
5. Refresh and confirm it persisted

### 5. Create a database page
1. Create a `Database` page
2. Add one or more fields
3. Add a row
4. Confirm the row appears in the rendered table view
5. Refresh and confirm the structure still exists

### 6. Create the other page types
1. Create `Board`, `Dashboard`, and `Capture` pages
2. Confirm each page type can be created and opened without crashing the shell

### 7. Workspace file upload
1. In `/dashboard/workspace`, upload a small file
2. Confirm it appears in the list
3. Add a description if the UI allows it
4. Refresh and confirm it still appears

### 8. Workspace file download
1. From the file list, click download on an uploaded file
2. Confirm the file is returned successfully
3. Confirm another user's file is not exposed through the URL

### 9. Workspace file search
1. Upload a file with an obvious name
2. Search by name or description
3. Confirm matching files appear
4. Confirm unrelated files do not appear

### 10. Settings -> model selection
1. Open `/dashboard/settings`
2. Confirm subscription + credits UI renders
3. Change the default model
4. Save it
5. Refresh and confirm the selection persisted

### 11. Settings -> Telegram connect link
1. Open `/dashboard/settings`
2. Click `Connect Telegram`
3. Confirm a Telegram deep link opens for the shared bot
4. Current expected truth: link generation exists, but full `/start <token>` account linking is still not finished

### 12. Settings -> deploy state
1. Open `/dashboard/settings`
2. Confirm runtime status renders
3. Confirm deploy is gated when no active subscription/credits exist
4. If you later create an active paid state, re-check deploy behavior

### 13. Logout
1. From the authenticated app, log out
2. Confirm you land back on `/login`
3. Confirm protected routes redirect back to login when signed out

### 14. Language smoke check
1. Switch locale if the UI exposes it
2. Confirm core auth/workspace/settings copy changes cleanly
3. Watch for missing translations or mixed-language screens

### 15. Manual API smoke checks
- `GET /api/instance`
- `PATCH /api/instance`
- `GET /api/workspace/files`
- `POST /api/workspace/files`
- `GET /api/workspace/files/[id]/download`

### Not fully manual-proven yet
- real Stripe payment -> credit grant -> deploy chain
- real shared Telegram bot account linking completion
- real message routing from shared Telegram bot into the correct runtime
- real credit decrement based on usage
- full live provisioning against a safe runtime

## 📚 Truth Sources
- `AGENTS.md` = repo rules
- `docs/ARCHITECTURE.md` = architecture truth
- `docs/WORKFLOW.md` = workflow / pipeline / done rules
- `docs/DEVELOPMENT.md` + `docs/LOCAL_TESTING_GUIDE.md` = local dev + testing truth
- Notion = planning, priorities, launch tasks
- `ADHD.md` = short current-state truth

If any of those drift from code, fix them.

## 🗒️ Nick's Notes
> 2026-04-22: Started the merge cut. Added workspace + page foundation to the main schema, auto-bootstrap for signed-in users, a new `/dashboard/workspace` shell, and workspace-first nav so the product starts moving from ClawHost platform UX toward PageBase product UX.

> 2026-04-22: Follow-up cut landed. Onboarding now routes into the workspace shell instead of chat, and selected workspace pages now support title + notes editing backed by `Page.content`.

> 2026-04-22: Phase 2 workspace cut landed. Users can now create typed pages from the workspace shell, and database pages now carry starter schema primitives (fields) instead of being dead placeholders.

> 2026-04-22: Database follow-up landed. Database pages now support basic row creation and a first rendered table view, so the workspace is starting to behave like a product instead of a shell.

> 2026-04-22: Step 2.1 workspace-files foundation started. Schema now includes workspace folders/files, root folders auto-bootstrap in the workspace, and the shell now exposes that file layer so the next cuts can add real upload/list/search behavior.

> 2026-04-22: Workspace file API cut landed. `/api/workspace/files` now supports authenticated listing and multipart uploads, backed by a local storage boundary and a new migration for workspace folders/files.

> 2026-04-22: Workspace upload UI landed. Users can now submit the first file directly from the workspace shell into the new workspace-files API instead of this work living only in backend code.

> 2026-04-22: Workspace download route landed. Uploaded files can now be pulled back out through an authenticated download endpoint, and the workspace shell exposes a direct download link for listed files.

> 2026-04-22: Local Prisma apply for the workspace-files migration is currently blocked by environment reachability. The repo `.env` points at PostgreSQL on `35.202.32.236:5432`, and that database was unreachable during `npx prisma migrate dev --skip-generate`.

> 2026-04-22: Docs audit cleanup landed. Live docs were rewritten around the real workspace-first product direction, legacy build scaffolding and historical reports were archived, and generated test artifacts were cleared so the repo truth surface is smaller and cleaner.

> 2026-04-22: Overnight launch-readiness pass. Targeted Playwright auth/signup/logout/onboarding/settings slice now passes 20/20 after fixing stale channel-first specs, callbackUrl handling, clean Playwright server boot, and logout truth. Current verified flow is provider-first onboarding -> `/chat`, with channel config in dashboard settings and logout landing on `/login`.

> 2026-04-22: Revenue and provisioning were audited. They are real in code, but still only partially proven end to end. Biggest open product question is whether provisioning should happen immediately after payment or only after onboarding/settings config is complete.

> 2026-04-21: Local eval pass done. Pulled latest master, merged `dev-laptop`, deleted that branch, created `dev-V1`, installed deps, started Docker Postgres, ran Prisma migrations + seed, and booted app at `http://localhost:3000`.

> 2026-04-21: Real checks run. Updated stale auth tests to match the stronger password policy and generic duplicate-email behavior. Result: `npm run test:run` now passes cleanly, 35/35.

> 2026-04-21: E2E signup spec re-run after fixing stale duplicate-email expectation. Result: `tests/e2e/auth/signup.spec.ts` passes 5/5 in Chromium.

> 2026-04-21: Full Playwright pass run. Result: 11/20 passing, 9 failing. Failure cluster is not random, it is mostly onboarding/dashboard tests that still expect the older channel-first wizard while the current UI is provider-first. Logout also lands on `/login` instead of the older home-page expectation.

> 2026-04-21: Production build now completes locally. Still shows NextAuth/Edge runtime warnings via `jose`, but the build itself succeeds.

> 2026-04-21: Lint workflow was broken because `next lint` now prompts interactively. Switched repo toward ESLint CLI config so lint now runs non-interactively and passes with warnings only.

> 2026-03-27: Automated testing setup complete. Vitest for unit/integration (34 tests), Playwright for E2E. Tests cover: auth flows, instance API, skills API, onboarding wizard, dashboard navigation. Run `npm test` for unit tests, `npm run test:e2e` for E2E.

> 2026-03-27: Auth/Layout refactor + provisioning flow review. Fixed: double header, middleware location (must be in src/), onboarding error handling, provision API now sets status='provisioning'. Flow: register → auto-login → onboarding → PATCH instance → POST provision → redirect to settings.

> 2026-03-28: Hybrid dev setup complete. Local Next.js connects to GCP PostgreSQL (34.121.34.198:5432). Created firewall rule `allow-postgres-dev`. Cleaned up local Docker. Next: configure Stripe webhook + test full signup flow.

> 2026-03-28: Deployed to Dokploy via API. PostgreSQL + Next.js app live at nestai.nickybruno.com. Deleted Cloud Run + Cloud SQL.

> 2026-03-28: Major session - Fixed OpenClaw provisioning. Key fixes: 1) Dokploy needs `sourceType: "raw"` for inline compose, 2) OpenClaw uses `TELEGRAM_BOT_TOKEN` + `OPENAI_API_KEY` env vars (not OPENCLAW_*), 3) Must set `agents.defaults.model` to selected model. Redesigned onboarding to 5-step flow with API key validation and Telegram pairing. Upgraded GCP VM to e2-standard-2 (8GB RAM) due to memory issues. **New IP: 35.202.32.236** - need to update DNS.

> 2026-03-27: NestAI brand system implemented. Automated testing setup (Vitest + Playwright).
