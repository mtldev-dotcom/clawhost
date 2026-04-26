# ⚡ Foyer — ADHD.md
> *Last updated: 2026-04-26 (M5 close)*

---

## 🧠 What Is This?
Foyer — workspace OS, second brain, and AI partner for solo professional workers.

---

## ✅ What It Does (Right Now)
- Solo-pro starter templates (5): Client CRM, Project Tracker, Weekly Review, Daily Plan, Meeting Notes
- Time-of-day greeting in workspace shell (GreetingLine component)
- Persona-aligned onboarding copy: "Pick your AI partner", "Use this AI partner" CTA
- Foyer rebrand complete (M5)
- User registration + login
- Signed-in users auto-bootstrap into a workspace with a root Home page + root folders (Inbox, Projects, Notes)
- `/dashboard/workspace` is the main product shell
- Onboarding picks a default platform-managed OpenRouter model, then routes into `/dashboard/workspace`
- Page types are real in the workspace create flow (Standard, Database, Board, Dashboard, Capture)
- Database pages support starter schema fields, row creation, and a simple table view
- Workspace file layer is real with root folders: Inbox, Projects, Notes
- Authenticated `/api/workspace/files` supports list + upload
- Workspace UI supports file upload, download, and search
- Settings page: model selection (5 models: Nemotron, Kimi K2.6, DeepSeek V4 Pro/Flash, MiniMax M2.7), deploy state, Telegram connect (broken locally — see Watch Out)
- Workspace shell is clean — all dev-grade scaffold copy removed
- Collapsible page tree sidebar with hover archive button per page
- File list has soft-delete button
- Empty workspace shows SMB starter templates: Client CRM, Weekly Ops Review, Meeting Notes
- Dashboard header model badge shows readable short-name, truncates on mobile
- AI Command Palette live: Cmd+K (or "Ask AI" button in header) opens modal, queries workspace context via Postgres FTS, calls OpenRouter, returns answer
- `/api/ai/command` route: auth + credit gate + context retrieval + model call + credit decrement (1 per call)
- Workspace full-text search index on Page.title + content (Postgres GIN)
- 5 platform models: Nemotron Super 120B (default, free), Kimi K2.6, DeepSeek V4 Pro, DeepSeek V4 Flash, MiniMax M2.7
- `/status` health-check page: app + DB status, credits granted last 24h
- Security headers on all routes: X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Legal stub pages live: `/legal/terms` and `/legal/privacy`
- Register page links to ToS and Privacy Policy
- Skills marketplace UI/API exists
- Bilingual UI (EN/FR)
- Chat UI + chat API routes exist in code
- Security hardening landed: rate limiting, crypto helpers, stronger registration password policy
- Local dev now runs on localhost + local Postgres
- `npm run db:reset-users` now deprovisions containers before wiping DB rows

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
| NextAuth | Auth sessions | `NEXTAUTH_SECRET` + `AUTH_SECRET` (both needed) |
| Telegram | Shared bot linking foundation | `TELEGRAM_SHARED_BOT_USERNAME` (optional, not set locally) |

---

## ⚠️ Watch Out
- **Build:** `NODE_ENV=development` in shell or `.env.local` breaks `next build`. The `build` script in `package.json` now hardcodes `NODE_ENV=production` — do not remove this.
- Next.js 15 + next-auth has prerender bug on error pages (build warnings OK — `transpilePackages` workaround is in place)
- Need `AUTH_TRUST_HOST=true` for NextAuth in production
- Brand: Emerald accent **once per screen max** — no decorative use
- Auth flow: Middleware protects `/dashboard` + `/onboarding`, uses JWT strategy
- Session stored in `authjs.session-token` cookie
- If you change `NEXTAUTH_SECRET`/`AUTH_SECRET`, old cookies will throw `JWTSessionError` until browser site data is cleared. Both `NEXTAUTH_SECRET` and `AUTH_SECRET` must be set and match.
- If you browse local dev over a Tailscale/LAN IP, `NEXTAUTH_URL` should match the URL you are actually using
- Layouts: Root layout has NO nav, public pages use PublicNav, dashboard uses DashboardHeader
- Middleware must be in `src/middleware.ts` (not project root) for src/app structure
- **Telegram connect** throws locally if `TELEGRAM_SHARED_BOT_USERNAME` is not set in `.env.local`. Add it to test that flow.
- **Logout** lands on `/` (homepage), not `/login`. From `/`, unauthenticated users see the marketing page.

---

## 🧪 Manual Story Flows You Can Test Yourself

### 1. Fresh signup → onboarding → workspace ✅
1. Open `/register`
2. Create a new account (password needs uppercase + lowercase + number, 8+ chars)
3. Auto-signs in and redirects to `/onboarding`
4. Pick a default model (7 options available)
5. Hit "Save model and continue" → step 2 → "Go to workspace"
6. Confirm redirect to `/dashboard/workspace` and workspace shell loads

### 2. Login → workspace ✅
1. Open `/login`
2. Sign in with an existing account
3. Redirects to `/dashboard` which immediately redirects to `/dashboard/workspace`
4. Confirm workspace shell loads with pages and file panels

### 3. Workspace bootstrap truth ✅
1. Open `/dashboard/workspace`
2. Confirm workspace exists with a "Home" root page
3. Confirm root folders exist: `Inbox`, `Projects`, `Notes` (auto-created on first load)

### 4. Create a standard page ✅
1. In the workspace sidebar, type a title and select `Standard`
2. Hit "Create page" — title field is now `required`, browser blocks empty submit
3. Open the page, edit title/content
4. Refresh and confirm it persisted

### 5. Create a database page ✅
1. Type a title and select `Database`
2. Open it, add one or more fields via "Add field"
3. Add a row via "Add row"
4. Confirm the row appears in the rendered table view
5. Refresh and confirm the structure still exists

### 6. Create the other page types ✅
1. Create `Board`, `Dashboard`, and `Capture` pages
2. Confirm each can be created and opened without crashing the shell

### 7. Workspace file upload ✅
1. In `/dashboard/workspace`, upload a small file using the upload widget
2. Confirm it appears in the file list
3. Refresh and confirm it still appears

### 8. Workspace file download ✅
1. From the file list, click download on an uploaded file
2. Confirm the file is returned successfully

### 9. Workspace file search ✅
1. Upload a file with an obvious name
2. Use the search widget to search by name
3. Confirm matching files appear

### 10. Settings → model selection ✅
1. Open `/dashboard/settings`
2. Confirm subscription + credits UI renders
3. Change the default model (5 options: Nemotron, Kimi K2.6, DeepSeek V4 Pro, DeepSeek V4 Flash, MiniMax M2.7)
4. Save it
5. Refresh and confirm the selection persisted

### 11. Settings → Telegram connect link ❌ Broken locally
- Requires `TELEGRAM_SHARED_BOT_USERNAME` in `.env.local`
- Without it, the "Connect Telegram" button throws a server error
- Add the var to test this flow; it is not set by default in local dev

### 12. Settings → deploy state ✅
1. Open `/dashboard/settings`
2. Confirm runtime status renders
3. Confirm deploy is gated when no active subscription/credits exist

### 13. Logout ✅ (lands on homepage, not /login)
1. From the authenticated app, click the logout button (top-right)
2. Confirms you land on `/` (the marketing homepage), not `/login`
3. Confirm protected routes redirect to `/login` when signed out

### 14. Language smoke check ✅
1. Use the language switcher in the top-right (EN/FR)
2. Confirm core auth/workspace/settings copy changes cleanly

### 15. Manual API smoke checks ✅
- `GET /api/instance` — requires auth session
- `PATCH /api/instance` — requires auth session
- `GET /api/workspace/files` — requires auth session
- `POST /api/workspace/files` — multipart upload, requires auth session
- `GET /api/workspace/files/[id]/download` — requires auth session, scoped to user

### Not fully manual-proven yet
- Real Stripe payment → credit grant → deploy chain
- Real shared Telegram bot account linking completion
- Real message routing from shared Telegram bot into the correct runtime
- Real credit decrement based on usage
- Full live provisioning against a safe runtime

---

## 📚 Truth Sources
- `AGENTS.md` = repo rules
- `docs/ARCHITECTURE.md` = architecture truth
- `docs/WORKFLOW.md` = workflow / pipeline / done rules
- `docs/DEVELOPMENT.md` + `docs/LOCAL_TESTING_GUIDE.md` = local dev + testing truth
- Notion = planning, priorities, launch tasks
- `ADHD.md` = short current-state truth

If any of those drift from code, fix them.

---

## 🗒️ Nick's Notes
> 2026-04-26 (M6): Closed M6 (solo pro onboarding & templates). Reframed onboarding copy for solo pros, added 5 solo-pro starter templates (Project Tracker, Daily Plan, Weekly Review replacing SMB ops templates), added time-of-day greeting in workspace, tightened empty-state to "Welcome to Foyer." 47 tests, 28 routes, lint clean.

> 2026-04-25 (M4): Closed M4 (production readiness) in one session. Added /status health-check, rate limiting on AI command route, security headers (X-Frame-Options/DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), legal stub pages (ToS + Privacy), register page footer links. Replaced platform model list with 5 models (Nemotron free as default). 47 tests, 27 routes, lint clean.

> 2026-04-25 (M3): Closed M3 (AI command palette) in one session. Added Postgres FTS index, workspace context retrieval library, /api/ai/command route with credit gate, CommandPalette Cmd+K component, wired into DashboardHeader. 47 tests pass.

> 2026-04-25 (M2): Closed M2 (workspace polish) in one session. Scrubbed all dev-grade scaffold copy, extracted collapsible WorkspacePageTree client component, styled textarea, added hover archive + file delete buttons, cleaned model indicator header, added SMB starter templates to empty state.

> 2026-04-25 (M1): Session recap. Closed M1 (schema cleanup). Fixed build regression (`NODE_ENV=development` in shell broke `next build` — hardcoded `NODE_ENV=production` in package.json build script). Added `AUTH_SECRET` to `.env.local` (next-auth v5 key). Added `allowedDevOrigins` for Tailscale dev IP. Added 4 cheap models to platform: Mistral Small 4, Gemini 3.1 Flash Lite, DeepSeek V4 Flash, Qwen 3.5 Flash. Fixed workspace page create/update/addField forms with `required` to prevent empty-title 500. Updated `reset-users.ts` to deprovision containers before wiping DB. Audited all 15 manual story flows — 13 confirmed working, Telegram connect broken locally (missing env var), logout lands on `/` not `/login` (correct behavior, wrong doc).

> 2026-04-22: Started the merge cut. Added workspace + page foundation to the main schema, auto-bootstrap for signed-in users, a new `/dashboard/workspace` shell, and workspace-first nav so the product starts moving from legacy platform UX toward workspace-first UX.

> 2026-04-22: Follow-up cut landed. Onboarding now routes into the workspace shell instead of chat, and selected workspace pages now support title + notes editing backed by `Page.content`.

> 2026-04-22: Phase 2 workspace cut landed. Users can now create typed pages from the workspace shell, and database pages now carry starter schema primitives (fields) instead of being dead placeholders.

> 2026-04-22: Database follow-up landed. Database pages now support basic row creation and a first rendered table view, so the workspace is starting to behave like a product instead of a shell.

> 2026-04-22: Step 2.1 workspace-files foundation started. Schema now includes workspace folders/files, root folders auto-bootstrap in the workspace, and the shell now exposes that file layer so the next cuts can add real upload/list/search behavior.

> 2026-04-22: Workspace file API cut landed. `/api/workspace/files` now supports authenticated listing and multipart uploads, backed by a local storage boundary and a new migration for workspace folders/files.

> 2026-04-22: Workspace upload UI landed. Users can now submit the first file directly from the workspace shell into the new workspace-files API instead of this work living only in backend code.

> 2026-04-22: Workspace download route landed. Uploaded files can now be pulled back out through an authenticated download endpoint, and the workspace shell exposes a direct download link for listed files.

> 2026-04-22: Docs audit cleanup landed. Live docs were rewritten around the real workspace-first product direction, legacy build scaffolding and historical reports were archived, and generated test artifacts were cleared so the repo truth surface is smaller and cleaner.

> 2026-04-22: Overnight launch-readiness pass. Targeted Playwright auth/signup/logout/onboarding/settings slice now passes 20/20 after fixing stale channel-first specs, callbackUrl handling, clean Playwright server boot, and logout truth.

> 2026-04-22: Revenue and provisioning were audited. They are real in code, but still only partially proven end to end.
