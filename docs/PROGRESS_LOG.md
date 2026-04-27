# Progress Log (Long-form)

> This file is the **long-form** engineering log.
> For the atomic, per-task execution log read `progress-report.md` at repo root.
> For short product-level notes read `ADHD.md` at repo root.

Entries in this file are **append-only** and written at milestone close.

Format:

```
## YYYY-MM-DD — <milestone or topic>
**Summary:** <one paragraph>
**What changed in the product:** <bullets>
**What changed in the codebase:** <bullets>
**Verification:** <commands + result>
**Open items:** <bullets or "none">
```

---

## 2026-04-22 — Repo reset and agent workflow contract

**Summary:** Cleaned up the branch graph, merged the overnight workspace-first work into `master`, created a fresh `dev-claude` branch, and established a hard execution contract for cheap-model agents.

**What changed in the product:** Nothing user-visible. This is a governance and repo-hygiene milestone.

**What changed in the codebase:**
- Merged `overnight/2026-04-22-launch-pass` → `master` via `--no-ff`
- Deleted `dev-V1` (fully contained in overnight) and `overnight/2026-04-22-launch-pass` locally and on origin
- Created `dev-claude` off post-merge `master`
- Added `plan-claude.md`, `progress-report.md`, `docs/AGENT_PIPELINE.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, `docs/PROGRESS_LOG.md`
- Rewrote `AGENTS.md` and `CLAUDE.md` as a hard contract
- Tightened `.gitignore`
- Archived legacy docs removal (already staged before merge)

**Verification:** `git branch -a` shows only `master` and `dev-claude` locally plus their remotes.

**Open items:** TASK M0-1 (and onward) awaiting execution by the designated cheap-model runner.

## 2026-04-22 — M0 close: Clean Foundation

**Summary:** Closed milestone M0 with a full verification pass after removing dead code, retiring stale onboarding-era specs, adding replacement smoke coverage for the current workspace flow, and landing baseline CI.

**What changed in the product:**
- The workspace-first product surface is cleaner, with dead dashboard components and legacy onboarding API routes removed
- Test coverage now better matches the current onboarding model-select flow and workspace shell instead of the retired channel-first UI
- CI now runs lint, unit/integration tests, and build on pushes and pull requests

**What changed in the codebase:**
- Removed broken re-exports, dead dashboard components, dead onboarding API routes, and orphan checks from the M0 cleanup list
- Replaced stale Playwright specs with `tests/e2e/onboarding/model-select.spec.ts` and `tests/e2e/workspace/workspace-shell.spec.ts`
- Added `.github/workflows/ci.yml`
- Updated `ADHD.md`, `plan-claude.md`, `progress-report.md`, and `docs/HANDOFF.md` to reflect M0 completion

**Verification:** `npm run lint && npm run test:run && npm run build` passed in one run at milestone close.

**Open items:** Next up is `TASK M1-1` for schema cleanup.

## 2026-04-25 — M1 close: Schema Cleanup

**Summary:** Closed milestone M1 after removing all deprecated Instance fields (`aiApiKey`, `channelToken`, `telegramChannelId`) and the `ProviderConfig` model from the Prisma schema, API handlers, and seed data. Discovered and fixed a build regression caused by `NODE_ENV=development` leaking from the shell environment into `next build`.

**What changed in the product:**
- No user-visible changes. Internal schema is cleaner; dead columns removed from the DB model.

**What changed in the codebase:**
- Prisma migration removing `aiApiKey`, `channelToken`, `telegramChannelId` from `Instance` and dropping `ProviderConfig`
- `src/app/api/instance/route.ts` PATCH handler cleaned of legacy field writes
- `prisma/seed.ts` updated to remove deprecated field references
- `package.json` build script hardened: `NODE_ENV=production next build` (prevents shell env pollution)
- `next.config.ts`: added `allowedDevOrigins` for Tailscale IP dev access
- `.env.local`: added `AUTH_SECRET` (next-auth v5 key name); removed `NODE_ENV=development` override

**Verification:** `npm run lint && npm run test:run && npm run build` — lint 0 errors (7 warnings, all pre-existing), 7 test files / 45 tests passed, build compiled and generated 12 static pages cleanly.

**Open items:** Next up is `TASK M2-1` — remove dev-grade copy from WorkspaceShell.

## 2026-04-25 — M2 close: Workspace Polish

**Summary:** Closed milestone M2 in a single session. Scrubbed all dev-grade scaffold copy from the workspace shell, polished the textarea content area, extracted a collapsible page tree client component, added hover archive and file delete buttons, cleaned up the model indicator in the header, and added SMB starter templates to the empty state.

**What changed in the product:**
- Workspace shell no longer shows "Phase 2", "Now in ClawHost / Now becoming PageBase" or other internal build notes
- Content textarea is taller (320px), non-resizable, and uses readable base font
- Sidebar page tree is now collapsible — chevron rotates on expand
- Non-root pages have a hover `×` archive button directly in the sidebar
- Files in the workspace file list now have a Delete button (soft-delete)
- Dashboard header model badge shows readable short-name (e.g. "Claude Sonnet 4 6") truncated at 120px
- Empty workspace state shows three SMB starter templates: Client CRM, Weekly Ops Review, Meeting Notes

**What changed in the codebase:**
- `WorkspaceShell.tsx`: removed dev copy, styled textarea, added delete button, added template UI, removed unused Link import
- `WorkspacePageTree.tsx`: new client component — collapsible tree with hover archive button
- `DashboardHeader.tsx`: added `modelShortName` helper
- `workspace/actions.ts`: added `deleteWorkspaceFile` and `createFromTemplate` server actions

**Verification:** `npm run lint && npm run test:run && npm run build` — 0 errors, 45 tests, build clean.

**Open items:** Next up is `TASK M3-1` — start of the AI Command Palette milestone.

## 2026-04-25 — M4 close: Production Readiness

**Summary:** Closed milestone M4 in a single session. Added a `/status` health-check page and API route, wired rate limiting into the AI command route (using the existing `src/lib/rate-limit.ts`), added security response headers to all routes via `next.config.ts`, created legal stub pages for ToS and Privacy, and added footer links to the register page. Also replaced the platform model list (was 7 legacy models) with 5 curated OpenRouter models — Nemotron Super 120B free as the new default.

**What changed in the product:**
- `/status` page: app operational badge, DB operational badge, last-updated timestamp
- AI command endpoint now returns 429 with Retry-After header if rate limit exceeded
- All HTTP responses include X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy
- `/legal/terms` and `/legal/privacy` stub pages live and linked from register page
- Platform model picker shows 5 models: Nemotron (free default), Kimi K2.6, DeepSeek V4 Pro, DeepSeek V4 Flash, MiniMax M2.7

**What changed in the codebase:**
- `src/app/api/status/route.ts` + `src/app/status/page.tsx`: new health-check surface
- `src/app/api/ai/command/route.ts`: rate limit check added after auth, before credit check
- `next.config.ts`: `headers()` function with 4 security headers
- `src/app/legal/terms/page.tsx` + `src/app/legal/privacy/page.tsx`: new stub pages
- `src/app/(auth)/register/page.tsx`: ToS + Privacy footer
- `src/lib/platform.ts` + `src/lib/env.ts`: replaced model list, updated default

**Verification:** `npm run lint && npm run test:run && npm run build` — 0 errors (7 pre-existing warnings), 47 tests, 27 routes clean.

**Open items:** Next up is `TASK M5-1` — start of the Billing/Stripe milestone.

## 2026-04-25 — M3 close: AI Command Palette

**Summary:** Closed milestone M3 in a single session. Added a Postgres GIN full-text search index on Page.title and Page.content, built a workspace context retrieval library, created the /api/ai/command route (auth + credit gate + FTS context + OpenRouter call + credit decrement), built the Cmd+K CommandPalette client component, wired it into the DashboardHeader, and added credit gate integration tests.

**What changed in the product:**
- Cmd+K (or "Ask AI" button in the dashboard header) opens an AI command palette
- AI reads the user's workspace pages via Postgres FTS and passes relevant context to the configured model
- Each command call decrements creditsBalance by 1 and gates users with 0 credits
- Quick command suggestions: summarize, action items, weekly update, client follow-ups

**What changed in the codebase:**
- `prisma/migrations/20260426002631_add_page_fulltext_index/migration.sql`: GIN index on Page title+content
- `src/lib/workspace-context.ts`: new library — FTS or recency-ordered context retrieval
- `src/app/api/ai/command/route.ts`: new POST route — full credit-gated AI command handler
- `src/components/dashboard/CommandPalette.tsx`: new Cmd+K client component
- `src/components/dashboard/DashboardHeader.tsx`: added CommandPalette import + mount
- `tests/integration/api/ai-command.test.ts`: 2 new tests (402 gate, 401 gate)

**Verification:** `npm run lint && npm run test:run && npm run build` — 0 errors, 47 tests, build clean (13 static pages).

**Open items:** Next up is `TASK M4-1`.

---

## M5 — Rebrand to Foyer + Launch Prep

**Status:** 🟢 Complete
**Started:** 2026-04-26
**Ended:** 2026-04-26

### Summary
Complete rebrand from ClawHost to Foyer across all user-visible surfaces, docs, and internal contract files. The product is now positioned as a workspace OS, second brain, and AI partner for solo professionals.

### Tasks completed
- M5-1: Inventory of all ClawHost references (A/B/C classification)
- M5-2: Rebranded package.json to `foyer`
- M5-3: Updated app metadata (title, description)
- M5-4: Rebranded EN UI copy + AI system prompt
- M5-5: Rebranded FR locale strings
- M5-6: Updated ToS and Privacy pages with foyer.work emails
- M5-7: Rewrote README.md for Foyer
- M5-8: Updated AGENTS.md, CLAUDE.md, ADHD.md
- M5-9: Rewrote public landing page for solo professionals
- M5-10: Hidden /chat and /skills routes from navigation
- M5-11: Created docs/LAUNCH_PROOF.md
- M5-12: Created docs/BRAND.md with domain/brand decisions
- M5-13: Final sweep confirmed no user-visible ClawHost strings
- M5-14: Milestone close with full verification

### Verification at close
```
lint: 0 errors, 7 warnings (all pre-existing)
tests: 8 files, 47 tests — all passed
build: ✓ Compiled, ✓ 28 routes — exit 0
```

### Key artifacts
- `docs/BRAND.md` — brand reference (colors, typography, voice, domain candidates)
- `docs/LAUNCH_PROOF.md` — pre-launch checklist

### What's next
M6 — Solo Pro Onboarding & Templates

---

## 2026-04-26 — M6 Solo Pro Onboarding & Templates

**Summary:** Reframed the first-run experience for solo professionals. Onboarding now leads with "Pick your AI partner" instead of a generic model-picker heading. The empty workspace shows 5 solo-pro starter templates in a 2-column grid, a time-of-day greeting appears once pages exist, and the empty-state heading now reads "Welcome to Foyer."

**What changed in the product:**
- Onboarding step 1 heading: "Pick your AI partner"
- Onboarding description: solo-pro copy explaining subscription-based model access
- Onboarding CTA: "Use this AI partner" (was "Save model and continue")
- 5 solo-pro starter templates: Client CRM, Project Tracker, Weekly Review, Daily Plan, Meeting Notes
- Time-of-day greeting (Good morning/afternoon/evening) on workspace when pages exist
- Empty-state heading: "Welcome to Foyer."

**What changed in the codebase:**
- `src/app/onboarding/page.tsx`: 3 copy strings updated
- `src/app/dashboard/workspace/actions.ts`: TEMPLATES — added project-tracker, daily-plan; renamed weekly-ops → weekly-review with solo-pro content
- `src/components/dashboard/WorkspaceShell.tsx`: templates array updated (5 entries), grid widened, empty-state copy updated, GreetingLine mounted
- `src/components/dashboard/GreetingLine.tsx`: new client component (time-of-day greeting)
- `src/app/dashboard/workspace/page.tsx`: passes userName to WorkspaceShell

**Verification:**
```
lint: 0 errors, 7 warnings (all pre-existing)
tests: 8 files, 47 tests — all passed
build: ✓ Compiled, 28 routes — exit 0
```

**Open items:** none

### Tasks completed
- M6-1: Reframe onboarding step 1 copy for solo pros
- M6-2: Add solo-pro starter templates (project tracker, daily plan, weekly review)
- M6-3: Add time-of-day greeting in workspace shell
- M6-4: Tighten workspace empty-state copy for solo pros
- M6-5: Milestone close

### What's next: M7 Second Brain Capture

---

## 2026-04-27 — M7 Second Brain Capture

**Summary:** Made capture frictionless. A persistent Quick Capture button (bottom-right, Cmd+Shift+K) lets a solo pro dump text or URLs from anywhere in the workspace. URL inputs are auto-summarized by the platform AI model and saved with the page title and a 2-sentence summary. All captures land in the Inbox folder. A new `/dashboard/inbox` page lists them oldest-first with one-tap "Move to Projects" or "Archive" triage actions. Inbox now appears in the main nav.

**What changed in the product:**
- Floating "+" button at bottom-right of workspace — always visible, opens Quick Capture dialog
- Cmd+Shift+K keyboard shortcut toggles capture dialog
- Text captures: saved as capture page in user's Inbox folder, first line (≤60 chars) becomes title
- URL captures: page title extracted, AI 2-sentence summary generated via OpenRouter, stored with original link; falls back to plain-text if credits = 0
- New `/dashboard/inbox` route: lists active Inbox captures, move-to-Projects and archive actions
- "Inbox" link added to the nav bar (desktop + mobile, EN + FR)

**What changed in the codebase:**
- `src/components/dashboard/QuickCapture.tsx`: new 'use client' component — floating button, dialog, keyboard shortcut
- `src/lib/url-capture.ts`: new lib — fetch URL, extract title, strip HTML, call OpenRouter for summary
- `src/app/dashboard/workspace/actions.ts`: added `quickCapture` (text + URL path), `triageCapture` (archive / move-projects), added `/dashboard/inbox` to revalidateWorkspacePaths
- `src/components/dashboard/WorkspaceShell.tsx`: mounts `<QuickCapture />`
- `src/app/dashboard/inbox/page.tsx`: new server component
- `src/components/dashboard/DashboardHeader.tsx`: added Inbox to navItems, added Inbox icon import, updated nav type
- `src/app/dashboard/layout.tsx`: updated translations type cast to include inbox
- `src/i18n/messages/en.json` + `fr.json`: added "inbox" nav key

**Verification:**
```
lint: 0 errors, 7 warnings (all pre-existing)
tests: 8 files, 47 tests — all passed
build: ✓ Compiled, 29 routes — exit 0
```

**Open items:** none

### What's next
M7 — Second Brain Capture
