

## Foyer Build Plan (v2)
This file replaces plan-claude.md. All work from this point forward is executed against
the Foyer product identity. Preferred executor: deepseek/deepseek-v3.2 (fallback:
minimax/minimax-m2.7) See Appendix K for the boot prompt.
- Why this file exists
The repo clawhost was rebuilt across milestones M0–M4 from a hosted-agent product into
a workspace-first AI product. The old name “ClawHost” is now misaligned with the
product: the workspace is the product face, the hosted-agent runtime is dormant, and the
target user is a solo professional who needs help organizing and planning their work.
Going forward, the product is named Foyer — the entryway to your work, where your notes,
plans, files, and AI partner all live in one place.
This plan picks up at M5 (Rebrand to Foyer + Launch) and runs through M9 (AI partner
behaviors). M0–M4 are recorded as historical milestones only and are not re-executed.
- Product identity (fixed — do not derive, do not override)
Any change that moves the product back toward “chat with an AI”, “host your own bot”, or
Product name:          Foyer
Tagline (working):     Your second brain. Your plan. Your AI partner.
Persona:               Solo professional worker (consultant, freelancer, indie pro,
knowledge worker working alone)
Primary jobs:          Organize notes & files. Plan the week. Think with an AI partner.
NOT:                   Team workspaces. Chat-first products. Hosted-agent marketplaces.
Multi-tenant OpenClaw container hosting.
Brand color (accent):  Emerald `#10b981` — once per screen, no decorative use
Aesthetic:             Dark theme, modern, professional
Display font:          Syne (already in design system)
UI/body font:          JetBrains Mono (already in design system)
Repo (legacy name):    `mtldev-dotcom/clawhost` (rename to `foyer` is non-blocking)
Active branch:         `dev-claude` (kept — see §8)
Current state:         M0–M4 closed, M5 active, all production-readiness in place

“team collaboration” is a product-direction regression and a STOP trigger.
- HOW TO USE THIS FILE (read every session, top to bottom)
## 1.
Read this file top to bottom.
- Read progress-report.md last 3 session entries.
- Read docs/HANDOFF.md.
- Find the first unchecked [ ] task in §10 Task List.
- Do ONLY that task. Do not batch. Do not skip ahead.
- Run the Verification commands listed under the task.
## 7.
If verification passes → check [x], append to progress-report.md, commit with the
exact message format shown, update docs/HANDOFF.md, stop.
## 8.
If verification fails OR any STOP trigger fires → write a STOP EVENT in progress-
report.md and stop. Do NOT attempt to fix. Ask the human.
Rule: Never mark a task [x] without pasting the raw verification output in progress-
report.md.
- Required reading before any task (every session)
- plan-foyer.md           (this file, top to bottom)
- plan-claude.md          (historical M0–M4 only, do not re-execute)
- progress-report.md      (last 3 session entries only)
- docs/HANDOFF.md         (current baton)
- AGENTS.md               (the contract)
- ADHD.md                 (short product state)
- Session startup checklist
git status                    # must say: nothing to commit, working tree clean
git branch --show-current     # must say: dev-claude
node --version                # must be 18+
npm run db:up                 # must succeed (Docker Postgres)

If any fails → STOP. Write in progress-report.md. Ask the human.
- Session end checklist
# 1. Paste verification output into progress-report.md
# 2. Mark the task [x] in this file
## # 3. Commit
git add -A
git commit -m "<conventional message from task>"
# 4. Paste commit hash into progress-report.md
git log -1 --oneline
# 5. Update docs/HANDOFF.md (overwrite, do not append)
## # 6. Push
git push origin dev-claude
- STOP-WORK TRIGGERS (mandatory)
TriggerAction
Any verification command fails
Log raw output → STOP EVENT. Do not fix. Ask
human.
File in docs/archive/** needs to
change
Stop. Frozen directory.
Prisma migration needs remote DBStop. Ask human.
A required env var is missingStop. Do not hardcode. Ask human.
Destructive git op implied
Stop. Never run --force, reset --hard, rebase
-i, commit --amend on pushed commits.
Te s t   fa i l i n g ,   “ f i x ”   i s   t o   d e l e t e / s k i p   i tStop. Log. Ask human.
New npm package needed
Stop. Requires docs/DECISIONS.md entry first.
Ta s k   s t e p s   a m b i g u o u sStop. Ask human. Do not guess.
Ta s k   c o n t r a d i c t s   t h e   wo r ks p a c e -f i r s t
/ solo-pro identity
Stop. Ask human.

Ta s k   wo u l d   r e - i n t r o d u c e   c h a t-f i r s t
UX or hosted-agent marketplace
Stop. Ask human.
-   F o r b i d d e n   o p e r a t i o n s
git push --force / git push -f
git reset --hard         (on any pushed branch)
git rebase -i
git commit --amend       (on a pushed commit)
git branch -D            (without --merged check first)
prisma migrate reset
npm install <package>    (without DECISIONS.md entry)
editing docs/archive/**
never commit:
.env  .env.local  tsconfig.tsbuildinfo  .next/
coverage/  playwright-report/  test-results/
- Allowed shell commands
# git (safe)
git status
git branch --show-current
git log --oneline -10
git diff
git add -A
git commit -m "<message>"
git push origin dev-claude
git pull origin dev-claude
# node / npm
node --version
npm run dev
npm run build
npm run lint
npm run test:run
npm run db:up
npm run db:down
npm run db:migrate
npm run db:seed

- Milestones already shipped (M0–M4)
These are recorded for historical reference. Do not re-execute. See plan-claude.md and
docs/PROGRESS_LOG.md for detail.
MilestoneOutcome
## M0 — Clean
## Foundation
Dead components/routes deleted, stale Playwright specs replaced,
GitHub Actions CI added.
## M1 — Schema
## Cleanup
Instance.channel/channelToken/aiApiKey/telegramChannelId
removed. ProviderConfig model removed.
## M2 —
## Workspace
## Polish
Dev-grade scaffold copy gone, collapsible page tree, file delete, SMB
starter templates, header model badge.
## M3 — AI
## Command
## Palette
Postgres FTS index, /api/ai/command, Cmd+K UI, credit metering,
integration tests.
## M4 —
## Production
## Readiness
/status page, rate limiting on AI route, security headers, legal stubs,
register-page legal links, 5 platform models.
- Task list
npm run db:studio
npx prisma generate
npx prisma migrate dev --name <name>   # only when task explicitly says to
# playwright (only when task says to run e2e)
npx playwright test <specific-spec-file> --project=chromium
# file existence checks
ls <path>
grep -r "<pattern>" src/ --include="*.ts" --include="*.tsx"
grep -c "<pattern>" <file>
# rebrand-specific (read-only — safe to run anytime)
grep -rn "ClawHost\|clawhost" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

Ta s ks   a r e   a t o m i c .   O n e   t a s k   =   o n e   c o m m i t .   C h e a p - m o d e l   s e s s i o n s   exe c u t e   o n e   t a s k   a n d
stop.
MILESTONE M5 — Rebrand to Foyer + Launch Prep
Goal: Every public-facing surface, doc, and copy string reflects the Foyer identity. The
product is positioned for solo professionals. Launch proof exists and is ready for human
sign-off.
Exit gate: npm run lint && npm run test:run && npm run build all pass. grep -ri
"clawhost\|ClawHost" src/ public/ returns matches only in deprecated/dormant
infrastructure files (Dokploy, docker-compose) — never in user-visible copy.
docs/LAUNCH_PROOF.md exists with the M5 checklist.
TASK M5-1 — Inventor y all ClawHost / clawhost references
Goal: Produce a single grep-based inventory of every reference that needs renaming. No
edits in this task — just the inventory. This is the map all subsequent M5 tasks rely on.
Files to touch: none (read-only).
## Steps:
## 1.
Run the following greps and paste the full output into progress-report.md under a
heading M5-1 inventory:
## 2.
After pasting, classify each match into one of three buckets in progress-report.md:
A — User-visible copy (UI strings, page titles, marketing copy, ToS, emails, OG
tags, app titles): rename to Foyer.
B — Doc / repo-internal (README, AGENTS, CLAUDE, ADHD, internal comments):
rename to Foyer.
C — Deprecated infrastructure (docker-compose, Dokploy YAML, Dockerfile,
grep -rn "ClawHost" src/ --include="*.ts" --include="*.tsx"
grep -rn "ClawHost" public/ --include="*.html" --include="*.svg" 2>/dev/null
grep -rn "ClawHost" --include="*.md" .
grep -rn "clawhost" src/ --include="*.ts" --include="*.tsx"
grep -rn "clawhost" --include="*.json" --include="*.yml" --include="*.yaml" .
grep -rn "support@clawhost\|feedback@clawhost\|privacy@clawhost" --include="*.ts" --include="*.tsx" --include="*.md" .

anything related to hosted-agent runtime): leave as-is. These are dormant per
AGENTS.md §1.
## Verification:
Inventory pasted into progress-report.md.
Each match is classified A, B, or C.
No file was modified in this task.
Commit message: chore: M5-1 inventory clawhost references for Foyer rebrand
## M5-1
TASK M5-2 — Rebrand package.json and tooling metadata
Goal: Update package.json name, description, and any tooling references. Update
next.config.ts brand-relevant settings (no behavior change).
Files to touch:
package.json
next.config.ts (only if it contains brand strings — confirm with grep first)
## Preflight:
grep -n "clawhost\|ClawHost" package.json
grep -n "clawhost\|ClawHost" next.config.ts
## Steps:
## 1.
In package.json, change:
## "name": "clawhost" → "name": "foyer"
"description" → "Foyer — workspace OS, second brain, and AI partner for
solo professionals."
## 2.
Do not rename any script keys (dev, build, db:up, etc.).
## 3.
If next.config.ts has a brand string, update it to Foyer.
## 4.
Run npm run build.

## 5.
Run npm run test:run.
## Verification:
npm run build exits 0.
npm run test:run exits 0.
grep "name" package.json | head -1 shows "name": "foyer".
Commit message: chore: M5-2 rename package to foyer in package.json
## M5-2
TASK M5-3 — Rebrand the app title and metadata
Goal: Update Next.js app metadata so browser tabs, OG tags, and the manifest say Foyer.
Files to touch:
src/app/layout.tsx (root metadata)
src/app/(public)/layout.tsx if present (public marketing layout)
Any metadata exports inside src/app/**/page.tsx that reference ClawHost
public/manifest.json (or equivalent)
public/favicon files only if they contain a CH/claw mark (visual change — defer to
user; just note it)
## Preflight:
grep -rn "ClawHost" src/app --include="*.ts" --include="*.tsx"
grep -rn "ClawHost" public/ 2>/dev/null
## Steps:
## 1.
For each metadata object found, replace:
title: 'ClawHost ...' → title: 'Foyer ...'
description: 'ClawHost ...' → description: 'Foyer — second brain, planner,
and AI partner for solo professionals.'
openGraph.title, openGraph.siteName → Foyer

twitter.title → Foyer
## 2.
If public/manifest.json exists, update name, short_name, description to Foyer.
## 3.
Do not change favicon files in this task. Note in progress-report.md: Favicon swap
deferred — needs Foyer mark from human.
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
grep -rn "ClawHost" src/app --include="*.ts" --include="*.tsx" returns 0
matches.
Commit message: feat: M5-3 update app metadata and manifest to Foyer
## M5-3
TASK M5-4 — Rebrand UI copy strings (English locale)
Goal: Replace every user-visible “ClawHost” string in the EN locale with “Foyer”. Update the
dashboard header, workspace shell, settings, marketing/landing copy, and AI command
system prompt.
Files to touch:
src/components/dashboard/DashboardHeader.tsx
src/components/dashboard/WorkspaceShell.tsx
src/app/api/ai/command/route.ts (the X-Title header and the AI system prompt’s
product-name reference)
Any messages/en.json or src/i18n/locales/en/*.json files (next-intl)
Any marketing pages under src/app/(public)/**/page.tsx
## Preflight:
grep -rn "ClawHost" src/components --include="*.tsx"
grep -rn "ClawHost" src/app --include="*.tsx"

grep -rn "ClawHost" src/app/api/ai/command/route.ts
find src -name "en*.json" -exec grep -l "ClawHost" {} \;
## Steps:
## 1.
For each match, replace ClawHost → Foyer. Be careful with case: clawhost → foyer,
## CLAWHOST → FOYER.
- In src/app/api/ai/command/route.ts, change:
'X-Title': 'ClawHost Workspace',
to:
'X-Title': 'Foyer',
## 3.
In the same file, find the system prompt that begins with You are the AI assistant
for a business workspace. Replace it with:
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
grep -rn "ClawHost" src/components --include="*.tsx" returns 0 matches.
grep -n "X-Title" src/app/api/ai/command/route.ts shows 'X-Title': 'Foyer'.
Commit message: feat: M5-4 rebrand EN UI copy and AI system prompt to Foyer
## M5-4
TASK M5-5 — Rebrand UI copy strings (French locale)
Goal: Mirror M5-4 in the FR locale.
Files to touch:
content: `You are the AI partner inside Foyer — a second brain and workspace for a solo professional. You have access to the user's workspace pages below. When answering, reference specific pages when relevant. Be concise, direct, and useful — like a thoughtful chief-of-staff. Output plain text or markdown only.\n\nWORKSPACE CONTEXT:\n${contextBlock}`,

messages/fr.json or src/i18n/locales/fr/*.json
Any FR-specific JSX strings (rare — most should be in JSON)
## Preflight:
find src messages -name "fr*.json" 2>/dev/null
grep -rn "ClawHost" --include="fr*.json" .
If preflight returns nothing, this task is a no-op — record that in progress-report.md and
mark complete.
## Steps:
## 1.
In each FR file with a ClawHost reference, replace with Foyer.
## 2.
Where the EN version was rewritten with new tagline copy in M5-4 (e.g. the AI partner
system prompt has no FR mirror — system prompts stay in English by design), no FR
change is needed for that string.
## 3.
Run npm run build.
## 4.
Run npm run lint.
## Verification:
npm run build exits 0.
grep -rn "ClawHost" messages/fr.json src/i18n 2>/dev/null returns 0 matches.
Commit message: feat: M5-5 rebrand FR locale strings to Foyer
## M5-5
TASK M5-6 — Update legal stub pages
Goal: Update Terms of Service and Privacy Policy to reference Foyer and the new
contact emails.
Files to touch:
src/app/legal/terms/page.tsx
src/app/legal/privacy/page.tsx
## Steps:

## 1.
In both files, replace every ClawHost with Foyer.
## 2.
Replace contact emails:
support@clawhost.com → support@foyer.work
privacy@clawhost.com → privacy@foyer.work
feedback@clawhost.com → feedback@foyer.work (If foyer.work is unavailable, the
human will swap to the chosen domain in a single follow-up commit. Do not block on
it.)
## 3.
In src/app/legal/terms/page.tsx, update the “Use of Service” section to read:
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
grep "ClawHost" src/app/legal/terms/page.tsx src/app/legal/privacy/page.tsx
returns 0 matches.
Both files contain support@foyer.work.
Commit message: docs: M5-6 update ToS and Privacy to Foyer
## M5-6
TASK M5-7 — Update README.md to Foyer
Goal: README.md describes the actual product — Foyer, the second-brain workspace and AI
partner for solo professionals.
File to touch: README.md
## Steps:
## 1.
Replace the H1 line # ClawHost with # Foyer.
## 2.
Replace the opening sentence with:
Foyer is an AI-powered workspace built for solo professionals. You are responsible for content you create. Do not use the service for illegal purposes.

## 3.
Replace the Current Product Truth section (the What is real in code right now list)
with a section titled What Foyer does today:
Workspace shell with typed pages (Standard, Database, Board, Dashboard, Capture)
Database pages with fields, rows, table view
Workspace file system (Inbox, Projects, Notes) with upload, download, search, soft
delete
Cmd+K AI command palette backed by your workspace context
Stripe-based subscription with monthly credits
English and French UI
Health-check page at /status
Legal pages (Terms, Privacy)
## 4.
Replace the Stack table with:
## | Layer        | Tech                                       |
| Frontend     | Next.js 15 (App Router), Tailwind, shadcn  |
| Backend      | Next.js API routes, Server Actions          |
| DB           | PostgreSQL + Prisma                         |
| Auth         | NextAuth v5                                 |
## | Payments     | Stripe                                      |
| AI           | OpenRouter (platform-managed)               |
| i18n         | next-intl                                   |
Remove Dokploy and Provisioning rows from the user-facing stack table — they
belong only to dormant Pro-tier infra.
## 5.
Replace the About placeholder with:
## 6.
Update the API Surface table to reflect actually shipped routes only:
/api/auth/register POST — registration
Foyer is a workspace OS, second brain, and AI partner for solo professionals.
You sign up, get a workspace, capture notes and files, plan your week, and ask
your AI partner for help — all in one place.
Foyer is built for solo professionals — consultants, freelancers, indie pros — who
need a single place to think, plan, capture, and act with an AI partner.

/api/instance GET/PATCH — instance config
/api/skills GET/POST — skills (deprecated, hidden)
/api/stripe/checkout POST
/api/stripe/webhook POST
/api/workspace/files GET/POST
/api/workspace/files/[id]/download GET
/api/ai/command POST
/api/status GET
## 7.
Update the Docs Map to add plan-foyer.md as the active build plan and mark plan-
claude.md as historical.
## 8.
Run npm run lint.
## Verification:
npm run lint exits 0.
grep -c "Foyer" README.md returns ≥ 5.
grep "ClawHost" README.md returns 0 matches.
Commit message: docs: M5-7 rewrite README for Foyer
## M5-7
TASK M5-8 — Update AGENTS.md, CLAUDE.md, ADHD.md to Foyer
Goal: Internal contract docs reflect the Foyer identity. Old references either updated or
marked as historical.
Files to touch:
AGENTS.md
CLAUDE.md
ADHD.md
## Steps:

## 1.
In AGENTS.md:
Change H1 # AGENTS.md — ClawHost Execution Contract → # AGENTS.md — Foyer
## Execution Contract.
In §1 “Product identity (fixed)”, replace the entire section with:
Replace remaining ClawHost strings with Foyer.
## 2.
In CLAUDE.md:
Replace ClawHost with Foyer everywhere.
Update the “Current intent” bullet to: current product direction: **Foyer —
workspace OS, second brain, AI partner for solo professionals**.
Update the “Read these first” pointer #1 from plan-claude.md to plan-foyer.md.
Add plan-claude.md as #2 with the note historical M0–M4 only.
- In ADHD.md:
Change #  ClawHost — ADHD.md → #  Foyer — ADHD.md.
Replace ClawHost with Foyer in the body.
Update the “What Is This?” line to: Foyer — workspace OS, second brain, and AI
partner for solo professional workers.
Add a new bullet at the top of “What It Does (Right Now)”: Foyer rebrand complete
## (M5).
Foyer is a **workspace OS, second brain, and AI partner for solo professional workers.**
It is **not**:
- a chat interface wrapper
- a hosted-agent bot marketplace
- an OpenClaw clone
- a generic "AI assistant" product
- a team collaboration product
The workspace (pages, databases, files, command palette) is the product face. The
hosted-agent runtime code (Dokploy, compose, OpenClaw) lives in the repo as deprecated
infrastructure and will be revived only as a Pro-tier power feature post-launch. See
`docs/DECISIONS.md` entry D2.
Any change that pulls the product back toward "chat with an AI" or "deploy your own
bot" as the primary UX is a **product-direction regression** and a stop-work trigger.

## 4.
Run npm run lint.
## Verification:
npm run lint exits 0.
grep -c "Foyer" AGENTS.md CLAUDE.md ADHD.md returns ≥ 3 per file.
grep "ClawHost" AGENTS.md CLAUDE.md ADHD.md returns 0 matches.
Commit message: docs: M5-8 rebrand AGENTS, CLAUDE, ADHD to Foyer
## M5-8
TASK M5-9 — Rewrite the public landing page for solo professionals
Goal: The public marketing page (/ for unauthenticated users) speaks to solo
professionals, not generic “SMB owners”. Hero, three feature cards, CTA, footer.
Files to touch:
src/app/page.tsx OR src/app/(public)/page.tsx (whichever holds the public
landing)
## Preflight:
ls src/app/page.tsx 2>/dev/null
ls src/app/(public)/page.tsx 2>/dev/null
## Steps:
## 1.
Open the public landing page.
## 2.
Replace the hero block with:
<section className="mx-auto max-w-3xl px-4 py-24 text-center">
<h1 className="text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>
Your second brain. Your plan. Your AI partner.
## </h1>
<p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
Foyer is a workspace built for solo professionals. Capture notes,
plan your week, and think alongside an AI that knows your work.
## </p>
<div className="mt-10 flex justify-center gap-3">
<Link href="/register" className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 transition">
Get started

## 3.
Replace the feature section with three cards (use existing Card component if available):
Capture everything — Notes, files, links, voice. Your workspace is your second
brain.
Plan with structure — Database pages, weekly reviews, action items. Built for solo
workflows.
Think with AI — Cmd+K asks your workspace anything. Your AI partner knows your
work.
## 4.
Add a footer with links: Terms, Privacy, Status, Sign in.
## 5.
Run npm run build.
## 6.
Run npm run lint.
## Verification:
npm run build exits 0.
grep -c "Foyer" src/app/page.tsx 2>/dev/null || grep -c "Foyer" src/app/\
(public\)/page.tsx returns ≥ 1.
grep "second brain" src/app returns ≥ 1 match (in the landing file).
Commit message: feat: M5-9 rewrite public landing for Foyer + solo pro persona
## M5-9
TASK M5-10 — Hide the deprecated /chat route and skills marketplace from
navigation
Goal: /chat and the skills marketplace pages still exist in code but should not be reachable
through any user-visible navigation. Keep the routes (do not delete) so existing links and
tests don’t break, but unlink them from menus.
## Preflight:
</Link>
<Link href="/login" className="rounded-md border px-6 py-3 text-sm font-medium hover:border-gray-400 transition">
Sign in
</Link>
## </div>
## </section>

grep -rn "/chat" src/components --include="*.tsx"
grep -rn "/skills\|/dashboard/skills" src/components --include="*.tsx"
## Steps:
## 1.
For each <Link href="/chat"> or equivalent in src/components/dashboard/* or any
nav file, remove the link element. Do not delete the destination page.
## 2.
Same for any /dashboard/skills link in nav.
## 3.
If a nav config object lists chat or skills, remove those entries.
## 4.
Add a comment above the deletion site: // Deprecated route, hidden in M5-10. See
docs/DECISIONS.md.
## 5.
Run npm run build.
## 6.
Run npm run lint.
## 7.
Run npm run test:run.
## Verification:
npm run build exits 0.
npm run test:run exits 0.
grep -rn 'href="/chat"' src/components --include="*.tsx" returns 0 matches.
Commit message: refactor: M5-10 hide /chat and skills routes from navigation
## M5-10
TASK M5-11 — Refresh docs/LAUNCH_PROOF.md for Foyer
Goal: The launch proof doc references Foyer and adds a brand-correctness row.
File to touch: docs/LAUNCH_PROOF.md
## Steps:
## 1.
Open docs/LAUNCH_PROOF.md.
## 2.
Replace # Launch Proof with # Foyer — Launch Proof.
## 3.
Add these rows to the test matrix table:

## 4.
Add a sign-off line:
- [ ] All "ClawHost" references in user-visible surfaces have been replaced
## 5.
Run npm run lint.
## Verification:
npm run lint exits 0.
grep "Foyer" docs/LAUNCH_PROOF.md returns ≥ 3 matches.
Commit message: docs: M5-11 update LAUNCH_PROOF for Foyer
## M5-11
TASK M5-12 — Add domain + brand notes for the human
Goal: The plan executor cannot register domains. Capture the human’s outstanding brand
decisions in docs/BRAND.md so they are not lost.
File to create: docs/BRAND.md
Content to write (copy exactly):
| 15 | Brand correctness | No "ClawHost" appears anywhere in user-visible UI | / | | |
| 16 | Landing page | Hero copy is "Your second brain. Your plan. Your AI partner." | / | | |
| 17 | Cmd+K identity  | AI introduces itself as "Foyer" if asked who it is | / | | |
## # Foyer — Brand Reference
> Single source of truth for Foyer's identity.
## ## Name
**Foyer** — the entryway to your work. Where your notes, files, plans, and AI partner live.
## ## Tagline (working)
> Your second brain. Your plan. Your AI partner.
## ## Persona
Solo professional worker — consultant, freelancer, indie pro, knowledge worker

working alone. Needs help organizing and planning.
## ## Voice
Direct. Calm. Useful. Not chirpy. Not corporate. Like a thoughtful chief-of-staff.
## ## Colors
## | Role          | Value      | Notes                                    |
## | ------------- | ---------- | ---------------------------------------- |
| Accent        | `#10b981`  | Emerald — once per screen, no decoration |
| Surface       | dark       | Existing dark theme stays                |
| Text          | high-contrast on dark surfaces            |
## ## Typography
## | Role        | Font          |
## | ----------- | ------------- |
## | Display     | Syne          |
| UI / body   | JetBrains Mono |
## Domain candidates (human to register)
## | Domain        | Status       | Notes                              |
## | ------------- | ------------ | ---------------------------------- |
| foyer.work    | TODO check   | Preferred                           |
| foyer.ai      | TODO check   | Premium pricing likely              |
| getfoyer.com  | TODO check   | Fallback if .work / .ai unavailable |
| foyerapp.com  | TODO check   | Fallback                            |
## Email addresses (configure once domain is locked)
## - `support@foyer.work`
## - `privacy@foyer.work`
## - `feedback@foyer.work`
## - `hello@foyer.work`
## Logo / mark
**TODO (human):** Foyer logotype. Mascot is intentionally absent — Foyer is a
grown-up product. Logo should be a clean wordmark in Syne, accent emerald
optionally for the dot of "i" or a leading mark.
## Open questions
- [ ] Final domain
- [ ] Logo wordmark

## Steps:
## 1.
Create docs/BRAND.md with the exact content above.
## 2.
Run npm run lint.
## Verification:
npm run lint exits 0.
ls docs/BRAND.md returns the path.
Commit message: docs: M5-12 add Foyer BRAND.md with domain + brand decisions
## M5-12
TASK M5-13 — Final sweep: confir m zero user-visible ClawHost strings
Goal: A final grep proves the user-visible rebrand is complete. Any remaining matches are
either in deprecated infra (allowed) or historical docs (allowed).
Files to touch: none (verification only).
## Steps:
## 1.
## Run:
grep -rn "ClawHost\|clawhost" src/ --include="*.ts" --include="*.tsx"
## 2.
Paste full output into progress-report.md under heading M5-13 final sweep.
## 3.
For every match, classify as either:
Acceptable (Dokploy/Docker/dormant infra in src/lib/dokploy.ts, docker-
compose*.yml, etc.)
Bug (any user-visible UI, copy, route handler).
## 4.
If any match is classified as Bug → STOP EVENT. Report which file and which line. Do
not fix in this task — open a follow-up M5-13a task.
## 5.
If all matches are Acceptable, mark this task complete.
- [ ] Favicon (currently inherits from ClawHost — must be replaced before launch)
- [ ] Twitter/X handle
- [ ] Pricing page copy (currently driven by Stripe checkout only)

## Verification:
Inventory pasted in progress-report.md.
All matches classified.
Zero user-visible matches remain.
Commit message: chore: M5-13 final sweep confirms Foyer rebrand is clean (no
commit if read-only)
Note: if no edit was needed, this commit can be skipped. Just paste verification into
progress-report.md.
## M5-13
TASK M5-14 — Milestone M5 close
Goal: Full verification, all truth files updated, M5 complete.
## Steps:
## 1.
Run: npm run lint && npm run test:run && npm run build
## 2.
Paste the full raw output into progress-report.md.
## 3.
Update docs/HANDOFF.md: State: M5 complete (Foyer rebrand). Next milestone M6
(Solo pro onboarding & templates).
## 4.
Update ADHD.md: in “What It Does (Right Now)”, confirm Foyer rebrand complete (M5)
is at the top of the list.
## 5.
Append M5 milestone summary to progress-report.md.
## 6.
Append M5 entry to docs/PROGRESS_LOG.md.
## Verification:
npm run lint && npm run test:run && npm run build all exit 0.
Commit message: chore: M5-14 close milestone M5 — Foyer rebrand verified
## M5-14
MILESTONE M6 — Solo Pro Onboarding & Templates

Goal: First-run experience speaks directly to a solo professional. Within 3 minutes of
signup, the user sees a populated workspace they recognize as their own.
Exit gate: Manual smoke test of the new onboarding flow passes. npm run lint && npm
run test:run && npm run build pass.
TASK M6-1 — Reframe onboarding step copy for solo pros
Goal: Step 1 of onboarding currently says “Pick a default model”. Reframe it as “Pick your AI
partner” and explain in solo-pro language what the choice means.
File to touch: src/app/onboarding/page.tsx (or wherever the onboarding step 1 UI lives)
## Preflight:
## Steps:
## 1.
In the onboarding step 1 component, replace the heading with:
Pick your AI partner
## 2.
Replace the subheading/description with:
Foyer comes with five AI models you can switch between any time. Most solo
pros stay on the default — it's free with your subscription. You can change
this later from Settings.
## 3.
Replace the button text from Save model and continue to Use this AI partner.
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
grep "Pick your AI partner" src/app/onboarding/page.tsx returns 1+ matches.
Commit message: feat: M6-1 reframe onboarding step 1 copy for solo pros
## M6-1
grep -rn "Save model and continue\|default model\|pick a model" src/app/onboarding 2>/dev/null

TASK M6-2 — Replace SMB star ter templates with solo-pro templates
Goal: The current empty-state offers Client CRM, Weekly Ops Review, Meeting Notes.
Replace Weekly Ops Review with Weekly Review (solo phrasing) and add two more solo-
pro templates: Project Tracker and Daily Plan.
Files to touch:
src/app/dashboard/workspace/actions.ts (the TEMPLATES constant)
src/components/dashboard/WorkspaceShell.tsx (the empty-state template buttons
array)
## Preflight:
## Steps:
## 1.
In src/app/dashboard/workspace/actions.ts, update the TEMPLATES object:
Rename 'weekly-ops' key to 'weekly-review'. Update its title to Weekly
Review and content to:
Add a new 'project-tracker' entry:
## 'project-tracker': {
title: 'Project Tracker',
pageType: 'database',
content: {
text: 'Track your active projects, status, and next milestones.',
database: {
fields: [
{ id: 'name', name: 'Project', type: 'text' },
{ id: 'client', name: 'Client', type: 'text' },
{ id: 'status', name: 'Status', type: 'select' },
{ id: 'next', name: 'Next milestone', type: 'text' },
{ id: 'due', name: 'Due', type: 'text' },
## ],
rows: [],
## },
grep -n "TEMPLATES" src/app/dashboard/workspace/actions.ts
grep -n "client-crm\|weekly-ops\|meeting-notes" src/components/dashboard/WorkspaceShell.tsx
## Week of [date]\n\n### Wins this week\n-\n\n### What I'm carrying\n-\n\n### Next week priorities\n1.\n2.\n3.\n\n### Reflections\n-

## },
## },
Add a new 'daily-plan' entry:
## 2.
In src/components/dashboard/WorkspaceShell.tsx, replace the template button array
with:
- Update the wrapper grid: grid gap-3 w-full max-w-sm → grid gap-3 w-full max-w-
md sm:grid-cols-2 so 5 templates fit nicely.
## 4.
Run npm run build.
## 5.
Run npm run test:run.
## Verification:
npm run build exits 0.
npm run test:run exits 0.
grep "project-tracker\|daily-plan\|weekly-review"
src/app/dashboard/workspace/actions.ts returns 3 matches.
Commit message: feat: M6-2 add solo-pro starter templates (project tracker,
daily plan, weekly review)
## M6-2
TASK M6-3 — Add a daily greeting on workspace open
## 'daily-plan': {
title: 'Daily Plan',
pageType: 'capture',
content: {
text: '## Today — [date]\n\n### Top 3\n- [ ]\n- [ ]\n- [ ]\n\n### Calls / meetings\n-\n\n### Tonight\'s shutdown notes\n-',
## },
## },
{ key: 'client-crm',     label: 'Client CRM',      desc: 'Track clients, deals, and next actions' },
{ key: 'project-tracker', label: 'Project Tracker', desc: 'Active projects, status, and milestones' },
{ key: 'weekly-review',  label: 'Weekly Review',   desc: 'Wins, priorities, and reflections' },
{ key: 'daily-plan',     label: 'Daily Plan',      desc: 'Your top 3, meetings, and shutdown notes' },
{ key: 'meeting-notes',  label: 'Meeting Notes',   desc: 'Fast capture for meetings and calls' },

Goal: When a user lands in /dashboard/workspace and the workspace already has at least
one custom page, show a small greeting at the top: “Good morning, [name].” or “Good
afternoon, [name].” or “Good evening, [name].” based on local time.
File to touch: src/components/dashboard/WorkspaceShell.tsx
## Steps:
## 1.
At the top of WorkspaceShell.tsx, add a small server-rendered greeting block. Since
time-of-day is best done client-side, extract a tiny client component:
'use client'
import { useEffect, useState } from 'react'
export function GreetingLine({ name }: { name: string }) {
const [greeting, setGreeting] = useState('Welcome back')
useEffect(() => {
const h = new Date().getHours()
if (h < 12) setGreeting('Good morning')
else if (h < 18) setGreeting('Good afternoon')
else setGreeting('Good evening')
## }, [])
return (
<p className="text-sm text-muted-foreground mb-4">
## {greeting}, {name}.
## </p>
## )
## }
Save this as src/components/dashboard/GreetingLine.tsx.
- In WorkspaceShell.tsx, import GreetingLine and render it at the top of the right panel
(the page content area), only when the workspace has more than just the root Home
page.
## 3.
Pass the user’s first name (split from session.user.name on the first space, fallback to
there).
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.

ls src/components/dashboard/GreetingLine.tsx returns the path.
Commit message: feat: M6-3 add time-of-day greeting in workspace shell
## M6-3
TASK M6-4 — Empty-state polish: solo-pro language
Goal: The empty-state heading currently says “Start your workspace” with subtext “Create
a page above, or pick a starter template to hit the ground running.” Tighten this for the solo-
pro persona.
File to touch: src/components/dashboard/WorkspaceShell.tsx
## Steps:
## 1.
Find the empty-state block from M2-7.
## 2.
Replace the heading with: Welcome to Foyer.
## 3.
Replace the subtext with: Pick a template to start. You can rename, edit, or
delete any of these later.
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
grep "Welcome to Foyer" src/components/dashboard/WorkspaceShell.tsx returns 1
match.
Commit message: refactor: M6-4 tighten workspace empty-state copy for solo pros
## M6-4
TASK M6-5 — Milestone M6 close
Goal: Full verification. Update truth files.
## Steps:
## 1.
Run: npm run lint && npm run test:run && npm run build

## 2.
Paste full raw output into progress-report.md.
## 3.
Update docs/HANDOFF.md to State: M6 complete, next milestone M7 (Second Brain
## Capture).
## 4.
Update ADHD.md “What It Does (Right Now)” to add: Solo-pro starter templates (5),
daily greeting, persona-aligned onboarding copy.
## 5.
Append M6 milestone summary to progress-report.md.
## 6.
Append M6 entry to docs/PROGRESS_LOG.md.
## Verification:
npm run lint && npm run test:run && npm run build all exit 0.
Commit message: chore: M6-5 close milestone M6 — solo pro onboarding verified
## M6-5
MILESTONE M7 — Second Brain Capture
Goal: Foyer becomes a real second brain by making capture frictionless. A solo pro can
dump anything in fast — text, links, voice — and triage later.
Exit gate: A user can (a) hit a Quick Capture button from anywhere in the workspace, (b)
save a URL with an AI-summarized title, and (c) review captures in an Inbox view. npm run
lint && npm run test:run && npm run build pass.
TASK M7-1 — Add Quick Capture floating but ton
Goal: A persistent floating “+” button at the bottom-right of the workspace opens a small
dialog for fast text capture. The captured text is saved as a new Standard page in the user’s
Inbox folder.
Files to touch:
src/components/dashboard/QuickCapture.tsx (new client component)
src/components/dashboard/WorkspaceShell.tsx (mount the component)
src/app/dashboard/workspace/actions.ts (add quickCapture server action)
## Steps:

## 1.
Add to src/app/dashboard/workspace/actions.ts:
## 2.
Create src/components/dashboard/QuickCapture.tsx:
export async function quickCapture(formData: FormData) {
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const text = String(formData.get('text') || '').trim()
if (!text) throw new Error('Capture text is required')
const workspace = await getWorkspaceForUser(session.user.id)
// Find or create Inbox folder anchor in workspace pages
const inbox = await prisma.page.findFirst({
where: { workspaceId: workspace.id, title: 'Inbox', parentId: workspace.rootPage?.id, status: 'active' },
## })
const parentId = inbox?.id ?? workspace.rootPage?.id ?? null
const siblingsCount = parentId
? await prisma.page.count({ where: { workspaceId: workspace.id, parentId, status: 'active' } })
## : 0
// Use first 60 chars as title
const title = text.split('\n')[0].slice(0, 60) || 'Quick capture'
await prisma.page.create({
data: {
workspaceId: workspace.id,
parentId,
title,
pageType: 'capture',
position: siblingsCount,
content: { text },
## },
## })
revalidateWorkspacePaths()
## }
'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { quickCapture } from '@/app/dashboard/workspace/actions'
export function QuickCapture() {
const [open, setOpen] = useState(false)
const [text, setText] = useState('')
const [pending, setPending] = useState(false)
const ref = useRef<HTMLTextAreaElement>(null)
useEffect(() => {

function handleKey(e: KeyboardEvent) {
if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
e.preventDefault()
setOpen(o => !o)
## }
if (e.key === 'Escape') setOpen(false)
## }
window.addEventListener('keydown', handleKey)
return () => window.removeEventListener('keydown', handleKey)
## }, [])
useEffect(() => {
if (open) setTimeout(() => ref.current?.focus(), 50)
## }, [open])
async function handleSubmit() {
if (!text.trim() || pending) return
setPending(true)
const fd = new FormData()
fd.set('text', text)
try {
await quickCapture(fd)
setText('')
setOpen(false)
} finally {
setPending(false)
## }
## }
return (
## <>
## <button
onClick={() => setOpen(true)}
className="fixed bottom-6 right-6 z-40 rounded-full bg-emerald-500 p-3 text-white shadow-lg hover:bg-emerald-600 transition"
title="Quick capture (Cmd+Shift+K)"
## >
<Plus className="h-5 w-5" />
## </button>
## {open && (
<div className="fixed inset-0 z-50 flex items-end justify-end p-6" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setOpen(false)}>
<div className="w-full max-w-md rounded-lg bg-background p-4 shadow-2xl border" onClick={e => e.stopPropagation()}>
<div className="flex items-center justify-between mb-3">
<p className="text-sm font-medium">Quick capture</p>
<button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
## </div>
## <textarea
ref={ref}

## 3.
Mount <QuickCapture /> near the end of WorkspaceShell.tsx‘s top-level container
(so it’s persistent on every workspace page).
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
ls src/components/dashboard/QuickCapture.tsx returns the path.
grep "quickCapture" src/app/dashboard/workspace/actions.ts returns 1+ match.
Commit message: feat: M7-1 add Quick Capture floating button (Cmd+Shift+K)
## M7-1
TASK M7-2 — Add URL-to-page capture (web clip)
Goal: A user can paste a URL into Quick Capture and get a saved page with the page’s title
and a one-paragraph AI summary.
Files to touch:
value={text}
onChange={e => setText(e.target.value)}
placeholder="Dump anything. We'll triage in your Inbox."
className="w-full min-h-[120px] rounded-md border p-3 text-sm resize-none focus:outline-none focus:border-emerald-500"
## />
<div className="mt-3 flex justify-end gap-2">
<Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
<Button size="sm" onClick={handleSubmit} disabled={pending || !text.trim()}>
{pending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
## Capture
</Button>
## </div>
## </div>
## </div>
## )}
## </>
## )
## }

src/app/dashboard/workspace/actions.ts (extend quickCapture to detect URL-only
inputs and route to captureUrl)
src/lib/url-capture.ts (new — fetches and summarizes URL)
## Steps:
## 1.
Create src/lib/url-capture.ts:
import { env } from '@/lib/env'
export interface CapturedUrl {
title: string
summary: string
url: string
## }
export async function captureUrl(url: string): Promise<CapturedUrl> {
// 1. Fetch the page (with timeout)
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 8000)
let html = ''
let title = url
try {
const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
if (!res.ok) throw new Error(`Fetch ${url} returned ${res.status}`)
html = await res.text()
} finally {
clearTimeout(timeout)
## }
// 2. Extract title
const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
if (match) title = match[1].trim().slice(0, 200)
// 3. Extract a rough text snippet (first ~3000 chars of stripped HTML)
const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)
// 4. Ask the AI for a 2-sentence summary
const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
'X-Title': 'Foyer',
## },

## 2.
Extend quickCapture in actions.ts:
const isUrl = /^https?:\/\/\S+$/i.test(text)
if (isUrl) {
const captured = await captureUrl(text)
await prisma.page.create({
data: {
workspaceId: workspace.id,
parentId,
title: captured.title,
pageType: 'capture',
position: siblingsCount,
content: {
text: `${captured.summary}\n\n[Original link](${captured.url})`,
url: captured.url,
## },
## },
## })
// Note: this AI call costs 1 credit — decrement
await prisma.user.update({
where: { id: session.user.id },
data: { creditsBalance: { decrement: 1 } },
## })
revalidateWorkspacePaths()
return
## }
// ... existing text capture path
- Add a credit-balance check at the top of quickCapture for the URL path: if
body: JSON.stringify({
model: env.PLATFORM_DEFAULT_MODEL,
max_tokens: 200,
messages: [
{ role: 'system', content: 'You write tight, useful 2-sentence summaries of web pages for a solo professional. No fluff.' },
{ role: 'user', content: `URL: ${url}\nTitle: ${title}\n\nContent:\n${stripped}` },
## ],
## }),
## })
let summary = ''
if (aiResp.ok) {
const data = await aiResp.json()
summary = data.choices?.[0]?.message?.content?.trim() ?? ''
## }
return { title, summary, url }
## }

creditsBalance <= 0 and input is a URL, fall through to plain-text capture (no
summary). Add a TODO comment to surface this in the UI later.
## 4.
Run npm run build.
## 5.
Run npm run test:run.
## Verification:
npm run build exits 0.
ls src/lib/url-capture.ts returns the path.
grep "captureUrl" src/app/dashboard/workspace/actions.ts returns 1+ match.
Commit message: feat: M7-2 capture URLs as pages with AI summary
## M7-2
TASK M7-3 — Add Inbox triage view
Goal: A dedicated /dashboard/inbox page lists all captures still in the Inbox, oldest first,
with a one-tap action to “Move to Projects” or “Archive”.
Files to touch:
src/app/dashboard/inbox/page.tsx (new)
src/app/dashboard/workspace/actions.ts (add triageCapture server action)
src/components/dashboard/DashboardHeader.tsx (add Inbox link in the nav)
## Steps:
## 1.
Add triageCapture server action:
export async function triageCapture(formData: FormData) {
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const pageId = String(formData.get('pageId') || '').trim()
const action = String(formData.get('action') || '').trim() // 'move-projects' | 'archive'
if (!pageId) throw new Error('Page id required')
const workspace = await getWorkspaceForUser(session.user.id)
const page = await prisma.page.findFirst({ where: { id: pageId, workspaceId: workspace.id } })
if (!page) throw new Error('Page not found')
if (action === 'archive') {

## 2.
Create src/app/dashboard/inbox/page.tsx (server component):
await prisma.page.update({ where: { id: page.id }, data: { status: 'archived' } })
} else if (action === 'move-projects') {
const projects = await prisma.page.findFirst({
where: { workspaceId: workspace.id, title: 'Projects', parentId: workspace.rootPage?.id, status: 'active' },
## })
if (projects) {
await prisma.page.update({ where: { id: page.id }, data: { parentId: projects.id } })
## }
## }
revalidateWorkspacePaths()
## }
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { triageCapture } from '@/app/dashboard/workspace/actions'
export default async function InboxPage() {
const session = await auth()
if (!session?.user?.id) redirect('/login')
const workspace = await getWorkspaceForUser(session.user.id)
const inbox = await prisma.page.findFirst({
where: { workspaceId: workspace.id, title: 'Inbox', parentId: workspace.rootPage?.id, status: 'active' },
## })
const captures = inbox
? await prisma.page.findMany({
where: { workspaceId: workspace.id, parentId: inbox.id, status: 'active' },
orderBy: { createdAt: 'asc' },
## })
## : []
return (
<div className="mx-auto max-w-3xl p-6">
<h1 className="text-2xl font-semibold mb-2">Inbox</h1>
<p className="text-sm text-muted-foreground mb-6">{captures.length} capture{captures.length === 1 ? '' : 's'} to triage.</p>
{captures.length === 0 && <p className="text-sm text-muted-foreground">Nothing to triage. Captures land here as you make them.</p>}
<div className="space-y-3">
## {captures.map(c => (
<div key={c.id} className="rounded-lg border p-4">
<p className="font-medium">{c.title}</p>
<p className="mt-1 text-sm text-muted-foreground line-clamp-3">{(c.content as { text?: string })?.text ?? ''}</p>
<div className="mt-3 flex gap-2">
<form action={triageCapture}>
<input type="hidden" name="pageId" value={c.id} />

- In DashboardHeader.tsx, add a small Inbox nav link with a count badge (count via a
server prop or a small client fetch — keep it simple: just the link, no badge).
## 4.
Run npm run build.
## 5.
Run npm run test:run.
## Verification:
npm run build exits 0.
npm run test:run exits 0.
ls src/app/dashboard/inbox/page.tsx returns the path.
Commit message: feat: M7-3 add inbox triage page and move/archive actions
## M7-3
TASK M7-4 — Milestone M7 close
Goal: Full verification. Update truth files.
## Steps:
## 1.
Run: npm run lint && npm run test:run && npm run build
## 2.
Paste full raw output into progress-report.md.
## 3.
Update docs/HANDOFF.md to State: M7 complete (Second Brain Capture). Next
<input type="hidden" name="action" value="move-projects" />
<button type="submit" className="text-xs rounded-md border px-2 py-1 hover:border-emerald-500">Move to Projects</button>
## </form>
<form action={triageCapture}>
<input type="hidden" name="pageId" value={c.id} />
<input type="hidden" name="action" value="archive" />
<button type="submit" className="text-xs rounded-md border px-2 py-1 hover:border-destructive">Archive</button>
## </form>
## </div>
## </div>
## ))}
## </div>
## </div>
## )
## }

milestone M8 (Planning Layer).
## 4.
Update ADHD.md: add Quick Capture (Cmd+Shift+K), URL capture with AI summary,
Inbox triage page to “What It Does (Right Now)”.
## 5.
Append M7 milestone summary to progress-report.md.
## 6.
Append M7 entry to docs/PROGRESS_LOG.md.
## Verification:
npm run lint && npm run test:run && npm run build all exit 0.
Commit message: chore: M7-4 close milestone M7 — second brain capture verified
## M7-4
MILESTONE M8 — Planning Layer
Goal: Foyer helps the solo pro plan their day and week. Action items are extracted from
pages, a daily plan view exists, and weekly review templates are auto-generated.
Exit gate: A user can open /dashboard/today, see their top 3 for the day from a Daily Plan
page, and see auto-extracted action items from their workspace. npm run lint && npm run
test:run && npm run build pass.
TASK M8-1 — Schema additions: ActionItem model
Goal: Add an ActionItem model linked to Page so AI-extracted action items have a stable
home.
File to touch: prisma/schema.prisma
## Steps:
## 1.
Add to prisma/schema.prisma, after the Page model:
model ActionItem {
id           String    @id @default(cuid())
workspaceId  String
workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
sourcePageId String?
sourcePage   Page?     @relation(fields: [sourcePageId], references: [id], onDelete: SetNull)
text         String

## 2.
Add the inverse relation to Page:
actionItems ActionItem[]
## 3.
Add the inverse relation to Workspace:
actionItems ActionItem[]
## 4.
Run npx prisma migrate dev --name add_action_items (local Postgres only).
## 5.
Run npx prisma generate.
## 6.
Run npm run build.
## Verification:
npm run build exits 0.
grep "model ActionItem" prisma/schema.prisma returns 1 match.
ls prisma/migrations | grep add_action_items returns a directory.
Commit message: feat: M8-1 add ActionItem model and migration
## M8-1
TASK M8-2 — Add /api/ai/extract-actions route
Goal: A POST route that takes a pageId, calls the AI to extract checklist-style action items
from that page’s content, and writes them to ActionItem.
File to create: src/app/api/ai/extract-actions/route.ts
## Steps:
## 1.
Create the file:
status       String    @default("open") // 'open' | 'done' | 'dismissed'
dueDate      DateTime?
createdAt    DateTime  @default(now())
updatedAt    DateTime  @updatedAt
@@index([workspaceId, status])
@@index([sourcePageId])
## }

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { checkAuthRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
export async function POST(req: Request) {
try {
const session = await auth()
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const rl = checkAuthRateLimit(`extract:${session.user.id}`)
if (!rl.allowed) return createRateLimitResponse(rl.resetAt)
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
if (user.creditsBalance <= 0) return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })
const body = await req.json()
const pageId = String(body.pageId || '').trim()
if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })
const workspace = await getWorkspaceForUser(session.user.id)
const page = await prisma.page.findFirst({ where: { id: pageId, workspaceId: workspace.id, status: 'active' } })
if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
const pageText = (page.content as { text?: string } | null)?.text ?? ''
if (!pageText.trim()) return NextResponse.json({ extracted: 0 })
const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
'X-Title': 'Foyer',
## },
body: JSON.stringify({
model: env.PLATFORM_DEFAULT_MODEL,
max_tokens: 600,
messages: [
{ role: 'system', content: 'Extract concrete action items from the user text. Return only a JSON array of strings, no commentary. Example: ["Email Sara about Q3 plan","Renew domain"]. If none, return [].' },
{ role: 'user', content: pageText.slice(0, 4000) },
## ],
## }),

## 2.
Run npm run build.
## 3.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
ls src/app/api/ai/extract-actions/route.ts returns the path.
Commit message: feat: M8-2 add /api/ai/extract-actions route
## M8-2
TASK M8-3 — Add /dashboard/today planning view
## })
if (!aiResp.ok) return NextResponse.json({ error: 'AI service error' }, { status: 502 })
const aiData = await aiResp.json()
const raw = aiData.choices?.[0]?.message?.content ?? '[]'
let items: string[] = []
try {
const cleaned = raw.replace(/```json|```/g, '').trim()
const parsed = JSON.parse(cleaned)
if (Array.isArray(parsed)) items = parsed.filter(s => typeof s === 'string' && s.trim()).slice(0, 20)
} catch {
items = []
## }
await prisma.user.update({ where: { id: session.user.id }, data: { creditsBalance: { decrement: 1 } } })
if (items.length > 0) {
await prisma.actionItem.createMany({
data: items.map(t => ({ workspaceId: workspace.id, sourcePageId: page.id, text: t.trim() })),
## })
## }
return NextResponse.json({ extracted: items.length })
} catch (e) {
console.error('extract-actions error', e)
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
## }
## }

Goal: A page at /dashboard/today that shows: (a) the user’s most recent Daily Plan page
(if one exists with today’s date in title or content), (b) all open ActionItems grouped by
source page.
File to create: src/app/dashboard/today/page.tsx
## Steps:
- Create the file:
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
export const dynamic = 'force-dynamic'
export default async function TodayPage() {
const session = await auth()
if (!session?.user?.id) redirect('/login')
const workspace = await getWorkspaceForUser(session.user.id)
const todayPlan = await prisma.page.findFirst({
where: {
workspaceId: workspace.id,
pageType: 'capture',
status: 'active',
## OR: [
{ title: { contains: 'Daily Plan', mode: 'insensitive' } },
{ title: { contains: 'Today', mode: 'insensitive' } },
## ],
## },
orderBy: { updatedAt: 'desc' },
## })
const openActions = await prisma.actionItem.findMany({
where: { workspaceId: workspace.id, status: 'open' },
orderBy: { createdAt: 'desc' },
take: 50,
include: { sourcePage: { select: { id: true, title: true } } },
## })
const grouped = new Map<string, typeof openActions>()
for (const a of openActions) {
const key = a.sourcePage?.title ?? 'Unsorted'
if (!grouped.has(key)) grouped.set(key, [])
grouped.get(key)!.push(a)

## 2.
Add a Today link to the dashboard header nav.
## 3.
Run npm run build.
## 4.
Run npm run lint.
## Verification:
npm run build exits 0.
## }
return (
<div className="mx-auto max-w-3xl p-6 space-y-8">
## <header>
<h1 className="text-2xl font-semibold">Today</h1>
<p className="text-sm text-muted-foreground">Your plan and open action items.</p>
## </header>
## <section>
<h2 className="text-lg font-medium mb-2">Plan</h2>
{todayPlan ? (
<div className="rounded-lg border p-4 whitespace-pre-wrap text-sm">
{(todayPlan.content as { text?: string })?.text ?? ''}
## </div>
## ) : (
<p className="text-sm text-muted-foreground">No Daily Plan yet — create one from the workspace empty-state templates.</p>
## )}
## </section>
## <section>
<h2 className="text-lg font-medium mb-2">Open action items</h2>
{grouped.size === 0 && <p className="text-sm text-muted-foreground">No action items extracted yet.</p>}
{[...grouped.entries()].map(([source, items]) => (
<div key={source} className="mb-4">
<p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{source}</p>
<ul className="space-y-1">
## {items.map(a => (
<li key={a.id} className="text-sm rounded-md border px-3 py-2">{a.text}</li>
## ))}
## </ul>
## </div>
## ))}
## </section>
## </div>
## )
## }

npm run lint exits 0.
ls src/app/dashboard/today/page.tsx returns the path.
Commit message: feat: M8-3 add /dashboard/today planning view
## M8-3
TASK M8-4 — Add “Extrac t ac tion items” but ton on standard pages
Goal: When a user is viewing a Standard or Capture page, an “Extract action items” button
calls /api/ai/extract-actions and shows the result count.
File to touch: src/components/dashboard/WorkspaceShell.tsx (or the page-detail panel
component)
## Steps:
## 1.
Find the page-detail render block in WorkspaceShell.tsx (where the <textarea
name="content"> is rendered for Standard and Capture pages).
## 2.
Add a small client component above the textarea:
'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
export function ExtractActionsButton({ pageId }: { pageId: string }) {
const [pending, setPending] = useState(false)
const [count, setCount] = useState<number | null>(null)
async function run() {
setPending(true)
try {
const res = await fetch('/api/ai/extract-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageId }) })
const data = await res.json()
setCount(typeof data.extracted === 'number' ? data.extracted : 0)
} finally {
setPending(false)
## }
## }
return (
<div className="mb-2 flex items-center gap-2">
<button onClick={run} disabled={pending} className="text-xs rounded-md border px-2 py-1 hover:border-emerald-500 disabled:opacity-50">
{pending ? <Loader2 className="inline h-3 w-3 animate-spin mr-1" /> : <Sparkles className="inline h-3 w-3 mr-1" />}
Extract action items

Save as src/components/dashboard/ExtractActionsButton.tsx.
- Mount it in the page detail render only for pageType === 'standard' or pageType ===
## 'capture'.
## 4.
Run npm run build.
## 5.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
ls src/components/dashboard/ExtractActionsButton.tsx returns the path.
Commit message: feat: M8-4 add Extract action items button on standard/capture
pages
## M8-4
TASK M8-5 — Milestone M8 close
Goal: Full verification. Update truth files.
## Steps:
## 1.
Run: npm run lint && npm run test:run && npm run build
## 2.
Paste full raw output into progress-report.md.
## 3.
Update docs/HANDOFF.md to State: M8 complete (Planning Layer). Next milestone
M9 (AI Partner Behaviors).
## 4.
Update ADHD.md: add ActionItem model, /dashboard/today, Extract action items
button, /api/ai/extract-actions.
## 5.
Append M8 milestone summary to progress-report.md.
## </button>
{count !== null && <span className="text-xs text-muted-foreground">Extracted {count}.</span>}
## </div>
## )
## }

## 6.
Append M8 entry to docs/PROGRESS_LOG.md.
## 7.
Add docs/DECISIONS.md entry: D-Foyer-1 — Action items live in their own table,
extracted on demand from page content. Not tied to a separate task model.
## Verification:
npm run lint && npm run test:run && npm run build all exit 0.
Commit message: chore: M8-5 close milestone M8 — planning layer verified
## M8-5
MILESTONE M9 — AI Partner Behaviors
Goal: The AI feels like a partner, not a tool. It can save its output as a new page. It can
answer scoped to a specific page. It can write the user a daily plan based on their
workspace.
Exit gate: A user can: (a) save a Cmd+K result as a page, (b) chat scoped to one page, (c)
generate a daily plan from /dashboard/today. npm run lint && npm run test:run && npm
run build pass.
TASK M9-1 — “Save as page” ac tion on Cmd+K result
Goal: When the AI returns a result in CommandPalette, the user can hit a “Save as page”
button that creates a new Standard page (in Inbox) with the result as content.
Files to touch:
src/components/dashboard/CommandPalette.tsx
src/app/dashboard/workspace/actions.ts (add saveAiResultAsPage)
## Steps:
## 1.
Add saveAiResultAsPage server action:
export async function saveAiResultAsPage(formData: FormData) {
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const title = String(formData.get('title') || 'AI result').trim().slice(0, 100) || 'AI result'
const text = String(formData.get('text') || '').trim()
if (!text) throw new Error('Empty result')

## 2.
In CommandPalette.tsx, where the result is shown, add a button:
<form action={saveAiResultAsPage}>
<input type="hidden" name="title" value={command.slice(0, 100)} />
<input type="hidden" name="text" value={result} />
<Button size="sm" variant="outline" type="submit">Save as page</Button>
## </form>
Place it next to the existing “New command” button.
## 3.
Run npm run build.
## 4.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
grep "saveAiResultAsPage" src/components/dashboard/CommandPalette.tsx returns
1+ match.
Commit message: feat: M9-1 save Cmd+K AI result as a workspace page
## M9-1
const workspace = await getWorkspaceForUser(session.user.id)
const inbox = await prisma.page.findFirst({
where: { workspaceId: workspace.id, title: 'Inbox', parentId: workspace.rootPage?.id, status: 'active' },
## })
const parentId = inbox?.id ?? workspace.rootPage?.id ?? null
const siblings = parentId ? await prisma.page.count({ where: { workspaceId: workspace.id, parentId, status: 'active' } }) : 0
await prisma.page.create({
data: {
workspaceId: workspace.id,
parentId,
title,
pageType: 'standard',
position: siblings,
content: { text },
## },
## })
revalidateWorkspacePaths()
## }

TASK M9-2 — Page-scoped AI chat
Goal: When viewing a page, a small “Ask about this page” input under the title sends the
page’s full content as the only context to /api/ai/command (overriding workspace-wide
retrieval).
Files to touch:
src/app/api/ai/command/route.ts (accept scopeToPageId)
src/components/dashboard/PageScopedAsk.tsx (new client component)
src/components/dashboard/WorkspaceShell.tsx (mount in page-detail render)
## Steps:
## 1.
Extend /api/ai/command/route.ts to accept scopeToPageId: string | undefined in
the body. When present, replace the workspace-context retrieval with a single-page
lookup:
Refactor so the existing path and the scoped path share the AI call code.
## 2.
Create src/components/dashboard/PageScopedAsk.tsx:
if (typeof body.scopeToPageId === 'string' && body.scopeToPageId) {
const page = await prisma.page.findFirst({
where: { id: body.scopeToPageId, workspaceId: workspace.id, status: 'active' },
select: { id: true, title: true, pageType: true, content: true },
## })
if (page) {
const text = (page.content as { text?: string } | null)?.text ?? ''
const contextBlock = `[Page: ${page.title} (${page.pageType})]\n${text}`
// ...rest of the AI call uses this contextBlock
## }
## }
'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
export function PageScopedAsk({ pageId }: { pageId: string }) {
const [q, setQ] = useState('')
const [a, setA] = useState<string | null>(null)
const [pending, setPending] = useState(false)
async function run() {
if (!q.trim()) return

## 3.
Mount <PageScopedAsk pageId={selectedPage.id} /> in the page-detail render (just
below the page title input).
- Run npm run build.
- Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
grep "scopeToPageId" src/app/api/ai/command/route.ts returns 1+ match.
setPending(true)
setA(null)
try {
const res = await fetch('/api/ai/command', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ command: q, scopeToPageId: pageId }),
## })
const data = await res.json()
setA(data.answer ?? data.error ?? '')
} finally {
setPending(false)
## }
## }
return (
<div className="mt-2">
<div className="flex gap-2">
## <input
value={q}
onChange={e => setQ(e.target.value)}
onKeyDown={e => { if (e.key === 'Enter') run() }}
placeholder="Ask about this page..."
className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
## />
<button onClick={run} disabled={pending || !q.trim()} className="rounded-md border px-3 py-1.5 text-sm hover:border-emerald-500 disabled:opacity-50">
{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
## </button>
## </div>
{a && <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">{a}</div>}
## </div>
## )
## }

Commit message: feat: M9-2 add page-scoped AI ask input
## M9-2
TASK M9-3 — Daily plan generator
Goal: A “Generate today’s plan” button on /dashboard/today that asks the AI to produce a
3-item top priority list based on the user’s open action items and recent pages, and saves it
as a new Daily Plan capture.
Files to touch:
src/app/dashboard/today/page.tsx (add the button)
src/app/dashboard/workspace/actions.ts (add generateDailyPlan server action)
## Steps:
## 1.
Add generateDailyPlan:
export async function generateDailyPlan() {
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
if (!user) throw new Error('User not found')
if (user.creditsBalance <= 0) throw new Error('No credits remaining')
const workspace = await getWorkspaceForUser(session.user.id)
const openActions = await prisma.actionItem.findMany({
where: { workspaceId: workspace.id, status: 'open' },
orderBy: { createdAt: 'desc' },
take: 30,
## })
const recentPages = await prisma.page.findMany({
where: { workspaceId: workspace.id, status: 'active', pageType: { in: ['standard', 'capture'] } },
orderBy: { updatedAt: 'desc' },
take: 5,
select: { title: true, content: true },
## })
const prompt =
`Open action items:\n${openActions.map(a => `- ${a.text}`).join('\n')}\n\n` +
`Recent pages:\n${recentPages.map(p => `- ${p.title}: ${((p.content as { text?: string } | null)?.text ?? '').slice(0, 200)}`).join('\n')}`
const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {

## 2.
In /dashboard/today/page.tsx, add a form button that calls generateDailyPlan:
method: 'POST',
headers: {
'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
'X-Title': 'Foyer',
## },
body: JSON.stringify({
model: env.PLATFORM_DEFAULT_MODEL,
max_tokens: 500,
messages: [
{ role: 'system', content: 'You are a chief-of-staff for a solo professional. Given their open action items and recent work, write a tight daily plan with: a top-3 priorities list, a calls/meetings line, and 2 lines of suggested shutdown notes for tonight. Be concrete. No fluff.' },
{ role: 'user', content: prompt },
## ],
## }),
## })
const data = await aiResp.json()
const text = data.choices?.[0]?.message?.content ?? ''
await prisma.user.update({ where: { id: session.user.id }, data: { creditsBalance: { decrement: 1 } } })
const inbox = await prisma.page.findFirst({
where: { workspaceId: workspace.id, title: 'Inbox', parentId: workspace.rootPage?.id, status: 'active' },
## })
const parentId = inbox?.id ?? workspace.rootPage?.id ?? null
const siblings = parentId ? await prisma.page.count({ where: { workspaceId: workspace.id, parentId, status: 'active' } }) : 0
await prisma.page.create({
data: {
workspaceId: workspace.id,
parentId,
title: `Daily Plan — ${new Date().toISOString().slice(0, 10)}`,
pageType: 'capture',
position: siblings,
content: { text },
## },
## })
revalidateWorkspacePaths()
## }
<form action={generateDailyPlan}>
<button type="submit" className="rounded-md bg-emerald-500 px-4 py-2 text-sm text-white hover:bg-emerald-600 transition">
Generate today's plan
## </button>
## </form>

Place it right under the Plan section heading.
## 3.
Run npm run build.
## 4.
Run npm run lint.
## Verification:
npm run build exits 0.
npm run lint exits 0.
grep "generateDailyPlan" src/app/dashboard/today/page.tsx returns 1+ match.
Commit message: feat: M9-3 add AI daily plan generator on /dashboard/today
## M9-3
TASK M9-4 — Milestone M9 close + roadmap update
Goal: Full verification. Update truth files. Add a forward-looking M10 sketch to
docs/ROADMAP.md.
## Steps:
## 1.
Run: npm run lint && npm run test:run && npm run build
## 2.
Paste full raw output into progress-report.md.
## 3.
Update docs/HANDOFF.md to State: M9 complete (AI Partner Behaviors). Foyer is
feature-rich for solo pros. Next milestone M10 (Polish & Growth) is post-
launch.
## 4.
Update ADHD.md: add Save Cmd+K result as page, Page-scoped AI ask, Generate
today's plan.
## 5.
Append M9 milestone summary to progress-report.md.
## 6.
Append M9 entry to docs/PROGRESS_LOG.md.
## 7.
Open docs/ROADMAP.md and add an M10 — Polish & Growth (sketch) section with
these bullet points (do not break them down to tasks yet — that’s a future plan-foyer-
v3.md if growth justifies it):
In-app feedback widget (NPS or thumbs)

Public marketing site rebuild on the Foyer brand
Referral program (give a credit, get a credit)
SEO foundation (sitemap, structured data, blog scaffolding)
Mobile-friendly capture surface
OpenClaw revival as Pro-tier (bring back the original multi-channel personal-agent
feature behind a Pro plan)
## Verification:
npm run lint && npm run test:run && npm run build all exit 0.
grep "M10" docs/ROADMAP.md returns 1+ match.
Commit message: chore: M9-4 close milestone M9 — Foyer feature roadmap shipped
## M9-4

MILESTONE M10 — Admin & Operations
Goal: Owner-only webmaster dashboard for managing users, credits, instances, and skills
from inside the app. No separate deployment — lives at /admin/* behind role-based guard.

TASK M10-1 — Webmaster admin dashboard
Goal: Full admin dashboard at /admin with owner-only access (role: admin). Covers users,
credits, subscription management, skills CRUD, and system health.
Files touched:
  prisma/schema.prisma (UserRole enum + role field on User)
  prisma/migrations/20260427214128_add_user_role/
  prisma/seed-admin.ts (one-shot owner promotion script)
  src/types/next-auth.d.ts (role in Session + JWT types)
  src/lib/auth.ts (role in jwt + session callbacks)
  src/middleware.ts (admin route guard)
  src/app/admin/layout.tsx (admin shell + sidebar nav)
  src/app/admin/page.tsx (stats overview)
  src/app/admin/users/page.tsx (user table)
  src/app/admin/users/UsersTable.tsx (client search/filter)
  src/app/admin/users/[id]/page.tsx (user detail)
  src/app/admin/users/[id]/client.tsx (credit/status/role mutations)
  src/app/admin/users/[id]/actions.ts (server actions)
  src/app/admin/skills/page.tsx (skills CRUD)
  src/app/admin/skills/client.tsx (toggle/add/delete)
  src/app/admin/skills/actions.ts (server actions)
  src/app/admin/system/page.tsx (instance health overview)
Steps:
  1. Add UserRole enum to prisma/schema.prisma; run migration.
  2. Seed owner account as admin via prisma/seed-admin.ts.
  3. Thread role through NextAuth jwt + session callbacks.
  4. Guard /admin/* in middleware — non-admins → /dashboard.
  5. Build admin layout + 5 pages.
Verification:
  npx prisma migrate dev exits 0.
  npx tsc --noEmit shows 0 errors in admin/auth/middleware files.
  npm run dev: /admin loads for admin user, redirects for regular user.
  Credit grant on /admin/users/[id] updates creditsBalance in DB.
Commit message: feat: M10-1 add owner admin dashboard at /admin
## M10-1

- Appendix A — Cheap-model boot prompt (paste into
OpenRouter)
For deepseek/deepseek-v3.2 (preferred)
You are an execution agent for the Foyer software repo (legacy repo name: clawhost). You operate on the branch `dev-claude`.
Your ONLY job is to execute the next unchecked task in `plan-foyer.md`.
STARTUP (do this before anything else):
- Read `plan-foyer.md` from top to bottom.
- Read the last 3 entries in `progress-report.md`.
- Read `docs/HANDOFF.md`.
- Find the first line in plan-foyer.md that reads `- [ ] M<number>-<number>`.
- That is your task. Execute ONLY that task.
## EXECUTION RULES:
- Follow the Steps section of the task exactly, in order.
- Run only the shell commands listed in the task or in the ALLOWED SHELL COMMANDS section.
- Do not install new npm packages.
- Do not modify files under docs/archive/.
- Do not run: git push --force, git reset --hard, git rebase -i, git commit --amend (on pushed commits), prisma migrate reset.
- One task = one commit. Do not batch multiple tasks into one commit.

For minimax/minimax-m2.7 (fallback)
## AFTER THE TASK:
- Run the Verification commands listed in the task.
- If verification passes: mark the task `[x]` in plan-foyer.md, append the session entry to progress-report.md, commit with the exact message from the task, push, overwrite docs/HANDOFF.md with current state, then STOP.
- If verification fails OR any STOP trigger fires: write a STOP EVENT entry in progress-report.md and stop. Do NOT attempt to fix the failure. Report it to the human.
You are NOT allowed to:
- skip tasks
- reorder tasks
- invent tasks not in plan-foyer.md
- mark a task [x] without pasting raw verification output in progress-report.md
- do "helpful" extra work beyond the current task
- guess when instructions are ambiguous — stop and report instead
Product-direction guardrails:
- Foyer is a workspace OS, second brain, and AI partner for solo professional workers.
- It is NOT a chat-first product, NOT a hosted-agent marketplace, NOT a team workspace, NOT an OpenClaw clone.
- Any task whose effect would shift the product toward those is a STOP trigger.
You are a code execution agent. Work on the Foyer repo (legacy name: clawhost), branch: dev-claude.
## BEFORE YOU DO ANYTHING:
Read these files in this exact order:
- plan-foyer.md (full file)
- progress-report.md (last 3 entries)
- docs/HANDOFF.md
## FIND YOUR TASK:
Search plan-foyer.md for the first line that looks like: - [ ] M<num>-<num>
That is your task ID. Read that entire task section.
## DO THE TASK:
Follow the Steps exactly. Run only the commands listed. Do not invent steps.
## WHEN DONE:
Run the Verification commands. If they pass: mark [x] in plan-foyer.md, write a task entry in progress-report.md with the raw terminal output pasted in, commit with the message from the task, push, update docs/HANDOFF.md, stop.
IF ANYTHING FAILS: write STOP EVENT in progress-report.md. Do not try to fix it. Stop.
## NEVER:
- batch tasks
- skip tasks
- run git push --force
- install npm packages
- edit docs/archive/

- Appendix B — Forbidden operations reference card
## NEVER RUN:
git push --force / git push -f
git reset --hard     (on pushed branches)
git rebase -i
git commit --amend   (if commit was already pushed)
git branch -D        (without --merged check first)
prisma migrate reset
npm install <anything>  (without DECISIONS.md entry first)
## NEVER COMMIT:
.env  .env.local  tsconfig.tsbuildinfo  .next/
coverage/  playwright-report/  test-results/
## NEVER TOUCH:
docs/archive/**      (frozen directory)
- Appendix C — Verification command reference
# Build and quality
npm run build
npm run lint
npm run test:run
# Git state
git status
git branch --show-current
git log -1 --oneline
git log --oneline -10
# File existence
ls <path>
ls -la <directory>
# Pattern search (used in preflight checks)
grep -n "<pattern>" <file>
grep -c "<pattern>" <file>
- mark a task done without pasting the verification output
- shift product direction toward chat-first, hosted-agent, or team-collab features (Foyer is for solo pros)

grep -r "<pattern>" src/ --include="*.ts" --include="*.tsx"
# Prisma (only when task explicitly says to run)
npx prisma generate
npx prisma migrate dev --name <name>
# Playwright (only when task explicitly says to run)
npx playwright test <spec-file> --project=chromium
- Appendix D — Domain & brand reference
See docs/BRAND.md (created in M5-12). Open items the human still owns:
Register the final domain (foyer.work preferred; getfoyer.com fallback)
Provide a Foyer wordmark + favicon
Configure DNS + Stripe live keys for production
Set support@foyer.work etc. as real mailboxes
- Appendix E — File rename map (M5 reference)
- End of plan
package.json                "name": "clawhost"   →   "name": "foyer"
ToS / Privacy contact       *@clawhost.com       →   *@foyer.work (or chosen domain)
Layout metadata             title: 'ClawHost...'   →   title: 'Foyer...'
AI X-Title header           'ClawHost Workspace' →   'Foyer'
README H1                   # ClawHost            →   # Foyer
ADHD.md H1                  #  ClawHost — ADHD   →   #  Foyer — ADHD
AGENTS.md H1                AGENTS.md — ClawHost  →   AGENTS.md — Foyer
CLAUDE.md "Read these"      plan-claude.md (#1)   →   plan-foyer.md (#1)
Files NOT renamed (kept clawhost legacy intentionally — dormant infra):
docker-compose.dev.yml
## Dockerfile
src/lib/dokploy.ts
prisma DB connection name (local dev only)

The next executable step is TASK M5-1 — Inventor y all ClawHost / clawhost references.
Open plan-foyer.md, find the first [ ], and follow the steps.