# ClawHost Build Plan (v1)

> **Executable plan for cheap AI coding agents.**
> Preferred executor: `deepseek/deepseek-v3.2` (fallback: `minimax/minimax-m2.7`)
> See Appendix K for the boot prompt to paste into OpenRouter.

---

## HOW TO USE THIS FILE (read every session, top to bottom)

1. Read this file top to bottom.
2. Read `progress-report.md` last 3 session entries.
3. Read `docs/HANDOFF.md`.
4. Find the **first unchecked `[ ]` task** in this file.
5. Do **ONLY** that task. Do not batch. Do not skip ahead.
6. Run the Verification command listed under the task.
7. If verification passes → check the box `[x]`, append to `progress-report.md`, commit with the exact message format shown, update `docs/HANDOFF.md`, stop.
8. If verification fails OR any STOP trigger fires → write a `STOP EVENT` in `progress-report.md` and stop. Do NOT attempt to fix. Ask the human.

**Rule: Never mark a task `[x]` without pasting the raw verification output in `progress-report.md`.**

---

## FIXED FACTS (do not change, do not derive, do not override)

```
Active branch:       dev-claude
Never commit to:     master
Node version:        18+ (check with: node --version)
Package manager:     npm
Database:            local Postgres via `npm run db:up`
Product identity:    Workspace OS for SMBs. NOT a chatbot. NOT a hosted-agent wrapper.
Frozen directory:    docs/archive/**  (never touch)
Migrations rule:     Only ADD new migration files. Never edit or delete existing ones.
Commit style:        Conventional Commits (feat: fix: chore: docs: test: refactor: sec:)
One task = one commit (no batching)
```

---

## REQUIRED READING BEFORE STARTING ANY TASK (every session)

```
1. plan-claude.md          (this file, top to bottom)
2. progress-report.md      (last 3 session entries only)
3. docs/HANDOFF.md         (current baton)
4. AGENTS.md               (the contract)
5. ADHD.md                 (short product state)
```

---

## SESSION STARTUP CHECKLIST (run these exact commands, paste outputs in progress-report.md)

```bash
git status                    # must say: nothing to commit, working tree clean
git branch --show-current     # must say: dev-claude
node --version                # must be 18+
npm run db:up                 # must succeed (Docker Postgres)
```

If any of the above fails → STOP. Write in progress-report.md. Ask human.

---

## SESSION END CHECKLIST (run every time before closing)

```bash
# 1. Paste verification output into progress-report.md
# 2. Mark the task [x] in this file
# 3. Commit
git add -A
git commit -m "<conventional message from task>"
# 4. Paste commit hash into progress-report.md
git log -1 --oneline
# 5. Update docs/HANDOFF.md (overwrite, do not append)
# 6. Push
git push origin dev-claude
```

---

## STOP-WORK TRIGGERS (mandatory — stop and ask human if any fires)

| Trigger | What to do |
|---|---|
| Any verification command fails | Log raw output in progress-report.md → STOP EVENT. Do not fix. Ask human. |
| File in `docs/archive/**` needs to change | Stop. This dir is frozen. |
| Prisma migration needs remote DB | Stop. Ask human. |
| A required env var is missing | Stop. Do not hardcode. Ask human. |
| Destructive git op implied | Stop. Never run force-push, reset --hard, rebase -i, amend pushed commit. |
| Test failing, "fix" is to delete/skip it | Stop. Log. Ask human. |
| New npm package needed | Stop. Requires DECISIONS.md entry first. Ask human. |
| Task steps are ambiguous | Stop. Ask human. Do not guess. |
| Task contradicts workspace-first product identity | Stop. Ask human. |

---

## FORBIDDEN OPERATIONS (never run these, ever)

```
git push --force / git push -f
git reset --hard   (on any pushed branch)
git rebase -i
git commit --amend (on a pushed commit)
git branch -D      (without --merged check first)
prisma migrate reset
npm install <package>  (without DECISIONS.md entry)
editing docs/archive/**
committing: .env  .env.local  tsconfig.tsbuildinfo  .next/  coverage/  playwright-report/  test-results/
```

---

## ALLOWED SHELL COMMANDS (only these — do not run commands not in this list without asking)

```bash
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
npm run db:studio
npx prisma generate
npx prisma migrate dev --name <name>   # only when task explicitly says to

# playwright (only when task says to run e2e)
npx playwright test <specific-spec-file> --project=chromium

# file existence checks
ls <path>
grep -r "<pattern>" src/ --include="*.ts" --include="*.tsx"
grep -c "<pattern>" <file>
```

---

## TASK LIST

---

### MILESTONE M0 — Clean Foundation

Goal: Repo is a sane, tested base. No user-visible product changes.
Exit gate: `npm run lint && npm run test:run && npm run build` all pass clean.

---

#### TASK M0-1 — Verify dev-claude branch baseline

**Goal:** Confirm the branch is clean and ready for work.
**Files to touch:** none (verification only).

**Steps:**
1. Run `git status`. Confirm output contains `nothing to commit, working tree clean`.
2. Run `git branch --show-current`. Confirm output is `dev-claude`.
3. Run `git log -1 --oneline`. Paste the output line into progress-report.md.
4. Run `npm run lint`. Paste the last 3 lines of output into progress-report.md.
5. Run `npm run test:run`. Paste the last 5 lines of output into progress-report.md.

**Verification:**
- `git status` is clean.
- `git branch --show-current` returns `dev-claude`.
- `npm run lint` exits with code 0.
- `npm run test:run` exits with code 0.

**Commit message:** `chore: verify M0-1 baseline checks pass`

**Mark complete when:** All four verification items pass.

- [x] M0-1

---

#### TASK M0-2 — Fix broken re-export in dashboard/actions.ts

**Goal:** Remove the `updateChannelConfig` re-export that points at a non-existent symbol. This is a latent runtime error.

**Files to touch:** `src/app/dashboard/actions.ts` (line 9 only).

**Preflight (run before changing anything):**
```bash
grep -n "updateChannelConfig" src/app/dashboard/actions.ts
```
Must return exactly: `9:export { updateChannelConfig, deployInstance } from './settings/actions'`
If it returns anything different → STOP. Context has changed. Ask human.

**Steps:**
1. Open `src/app/dashboard/actions.ts`.
2. Find line 9: `export { updateChannelConfig, deployInstance } from './settings/actions'`
3. Change it to: `export { deployInstance } from './settings/actions'`
4. Save the file.
5. Run `npm run build`.
6. Run `grep -r "updateChannelConfig" src/`. Must return 0 matches.

**Verification:**
- `npm run build` exits with code 0.
- `grep -r "updateChannelConfig" src/` returns 0 lines.

**Commit message:** `fix: remove broken updateChannelConfig re-export from dashboard/actions`

**Mark complete when:** Both verification items pass.

- [x] M0-2

---

#### TASK M0-3 — Delete dead UI components (AiSetup, ChannelSetup, ChatInterface, InstanceCard)

**Goal:** Remove four components that are exported but imported nowhere. Dead code that confuses future agents.

**Files to delete:**
- `src/components/dashboard/AiSetup.tsx`
- `src/components/dashboard/ChannelSetup.tsx`
- `src/components/dashboard/ChatInterface.tsx`
- `src/components/dashboard/InstanceCard.tsx`

**Preflight (MUST run each check before deleting — if any returns matches outside the file itself, STOP):**
```bash
grep -r "AiSetup" src/ --include="*.tsx" --include="*.ts"
grep -r "ChannelSetup" src/ --include="*.tsx" --include="*.ts"
grep -r "ChatInterface" src/ --include="*.tsx" --include="*.ts"
grep -r "InstanceCard" src/ --include="*.tsx" --include="*.ts"
```
Each grep must return ONLY lines from the component file itself (its own definition).
If any grep returns a match in a different file → STOP. That component is still used. Ask human.

**Steps:**
1. Run all four preflight greps. Confirm each returns only self-references.
2. Delete the four files:
   ```bash
   rm src/components/dashboard/AiSetup.tsx
   rm src/components/dashboard/ChannelSetup.tsx
   rm src/components/dashboard/ChatInterface.tsx
   rm src/components/dashboard/InstanceCard.tsx
   ```
3. Run `npm run build`.
4. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run test:run` exits with code 0.
- `ls src/components/dashboard/AiSetup.tsx` returns "No such file or directory".

**Commit message:** `chore: delete dead dashboard UI components (AiSetup, ChannelSetup, ChatInterface, InstanceCard)`

**Mark complete when:** All three verification items pass.

- [x] M0-3

---

#### TASK M0-4 — Delete dead API routes (test-provider, approve-pairing)

**Goal:** Remove the two legacy onboarding API routes that belong to the old provider-key-paste flow. The new onboarding does not call them.

**Files to delete:**
- `src/app/api/onboarding/test-provider/` (entire directory)
- `src/app/api/onboarding/approve-pairing/` (entire directory)

**Preflight:**
```bash
grep -r "onboarding/test-provider" src/ --include="*.ts" --include="*.tsx"
grep -r "onboarding/approve-pairing" src/ --include="*.ts" --include="*.tsx"
grep -r "onboarding/test-provider" tests/ --include="*.ts"
grep -r "onboarding/approve-pairing" tests/ --include="*.ts"
```
- The `src/` greps must return 0 matches.
- The `tests/` greps may return matches in E2E spec files only. That is acceptable — those specs will be replaced in M0-6.
- If `src/` greps return any match → STOP. Ask human.

**Steps:**
1. Run all four preflight greps.
2. Delete the directories:
   ```bash
   rm -rf src/app/api/onboarding/test-provider
   rm -rf src/app/api/onboarding/approve-pairing
   ```
3. Check if `src/app/api/onboarding/` is now empty:
   ```bash
   ls src/app/api/onboarding/
   ```
   If it is empty, delete the parent dir too:
   ```bash
   rmdir src/app/api/onboarding/
   ```
4. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.
- `ls src/app/api/onboarding/` returns "No such file or directory".

**Commit message:** `chore: delete dead onboarding API routes (test-provider, approve-pairing)`

**Mark complete when:** Both verification items pass.

- [x] M0-4

---

#### TASK M0-5 — Delete dead src/types if orphaned

**Goal:** Check for a `src/types` directory. If it only contains types used by the deleted components, remove it. If it contains types still used elsewhere, leave it and mark this task complete with a note.

**Preflight:**
```bash
ls src/types/ 2>/dev/null || echo "NO_TYPES_DIR"
```

**Steps:**
1. If output is `NO_TYPES_DIR` → skip to verification. This task is already done.
2. If `src/types/` exists, list its files:
   ```bash
   ls src/types/
   ```
3. For each `.ts` file in `src/types/`, run:
   ```bash
   grep -r "from '@/types'" src/ --include="*.ts" --include="*.tsx"
   grep -r "from '../types'" src/ --include="*.ts" --include="*.tsx"
   ```
4. If grep returns 0 matches for all type imports → delete the directory:
   ```bash
   rm -rf src/types/
   ```
5. If grep returns matches in files that still exist → leave `src/types/` in place. Note which types are still used in progress-report.md and mark the task complete.
6. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.

**Commit message:** `chore: remove orphaned src/types directory` (or `chore: confirm src/types still needed, leaving in place`)

**Mark complete when:** Build passes regardless of whether types dir was deleted or kept.

- [x] M0-5

---

#### TASK M0-6 — Retire stale Playwright E2E specs

**Goal:** Delete the two stale Playwright specs that test a UI that no longer exists (provider-key-paste onboarding, old channel-first settings).

**Files to delete:**
- `tests/e2e/onboarding/wizard.spec.ts`
- `tests/e2e/dashboard/settings.spec.ts`

**Preflight (confirm these are truly stale):**
```bash
grep -c 'sk-\.\.\.' tests/e2e/onboarding/wizard.spec.ts
grep -c 'test-provider' tests/e2e/onboarding/wizard.spec.ts
grep -c 'OpenAI' tests/e2e/dashboard/settings.spec.ts
```
Each must return a number > 0 (confirming they reference old UI).
If all return 0, the specs may already be updated — STOP. Ask human to re-check.

**Steps:**
1. Run preflight greps to confirm staleness.
2. Delete:
   ```bash
   rm tests/e2e/onboarding/wizard.spec.ts
   rm tests/e2e/dashboard/settings.spec.ts
   ```
3. Run `npm run test:run` (Vitest only, not Playwright — these are Playwright files).
4. Run `npm run build`.

**Verification:**
- `npm run test:run` exits with code 0.
- `npm run build` exits with code 0.
- `ls tests/e2e/onboarding/wizard.spec.ts` returns "No such file or directory".

**Commit message:** `test: retire stale Playwright specs for old channel-first onboarding UI`

**Mark complete when:** All three verification items pass.

- [x] M0-6

---

#### TASK M0-7 — Add replacement Playwright spec: onboarding model-select flow

**Goal:** Add a new E2E spec that tests the current onboarding UI (platform-managed model selection, not provider-key paste).

**File to create:** `tests/e2e/onboarding/model-select.spec.ts`

**Content to write (copy exactly):**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Onboarding — platform model selection', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const email = `onboard-${Date.now()}-${testInfo.parallelIndex}@example.com`
    const res = await request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Onboard Test' },
    })
    expect(res.status()).toBe(201)
    // Store for use in test
    testInfo.annotations.push({ type: 'email', description: email })
  })

  test('step 1 shows platform model options, not provider key input', async ({ page, request }, testInfo) => {
    const email = testInfo.annotations.find(a => a.type === 'email')?.description ?? ''
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding')
    }
    // Should NOT have a provider-key input
    await expect(page.locator('input[placeholder="sk-..."]')).toHaveCount(0)
    // Should show model selection options
    await expect(page.getByText('Platform-managed AI access')).toBeVisible({ timeout: 8000 })
  })

  test('can select a model and proceed to workspace', async ({ page }, testInfo) => {
    const email = testInfo.annotations.find(a => a.type === 'email')?.description ?? ''
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding')
    }
    // Mock the instance PATCH so no real DB write needed in E2E
    await page.route('**/api/instance', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ instance: {} }) })
      } else {
        await route.continue()
      }
    })
    // Click save model button
    await page.getByRole('button', { name: /save model/i }).click()
    // Should advance to step 2
    await expect(page.getByText('Telegram')).toBeVisible({ timeout: 8000 })
    // Click go to workspace
    await page.getByRole('button', { name: /go to workspace/i }).click()
    // Should land in workspace
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard\/workspace/)
  })
})
```

**Steps:**
1. Create the file `tests/e2e/onboarding/model-select.spec.ts` with the exact content above.
2. Run `npm run lint`.
3. Run `npm run test:run` (Vitest only — E2E not required to run now; they run at M0-9).

**Verification:**
- `npm run lint` exits with code 0.
- `npm run test:run` exits with code 0.
- `ls tests/e2e/onboarding/model-select.spec.ts` returns the file path.

**Commit message:** `test: add Playwright spec for current platform-model onboarding flow`

**Mark complete when:** All three verification items pass.

- [x] M0-7

---

#### TASK M0-8 — Add replacement Playwright spec: workspace shell smoke

**Goal:** Add a new E2E spec that tests the current workspace shell (create page, see folders).

**File to create:** `tests/e2e/workspace/workspace-shell.spec.ts`

**Steps:**
1. First create the directory if it does not exist:
   ```bash
   mkdir -p tests/e2e/workspace
   ```
2. Create the file `tests/e2e/workspace/workspace-shell.spec.ts` with the exact content below.
3. Run `npm run lint`.
4. Run `npm run test:run`.

**Content to write (copy exactly):**
```typescript
import { test, expect } from '@playwright/test'

async function registerAndLogin(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never, request: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[1] : never, testInfo: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[2] : never) {
  const email = `workspace-${Date.now()}-${testInfo.parallelIndex}@example.com`
  await request.post('/api/auth/register', {
    data: { email, password: 'TestPassword123!', name: 'WS Test' },
  })
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', 'TestPassword123!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
  if (!page.url().includes('/dashboard/workspace')) {
    await page.goto('/dashboard/workspace')
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
  }
}

test.describe('Workspace shell', () => {
  test('loads the workspace shell after login', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await expect(page.getByText('My Workspace')).toBeVisible({ timeout: 8000 })
  })

  test('shows root folders in workspace', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await expect(page.getByText('Inbox')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Projects')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Notes')).toBeVisible({ timeout: 8000 })
  })

  test('can create a new standard page', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await page.fill('input[name="title"]', 'My Test Page')
    await page.getByRole('button', { name: /create page/i }).click()
    await expect(page.getByText('My Test Page')).toBeVisible({ timeout: 8000 })
  })

  test('dashboard redirects to workspace', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard\/workspace/)
  })
})
```

**Verification:**
- `npm run lint` exits with code 0.
- `npm run test:run` exits with code 0.
- `ls tests/e2e/workspace/workspace-shell.spec.ts` returns the file path.

**Commit message:** `test: add Playwright spec for workspace shell smoke flows`

**Mark complete when:** All three verification items pass.

- [x] M0-8

---

#### TASK M0-9 — Add GitHub Actions CI workflow

**Goal:** Add a CI pipeline that runs lint + tests + build on every push and PR to dev-claude.

**File to create:** `.github/workflows/ci.yml`

**Steps:**
1. Create the directory if it does not exist:
   ```bash
   mkdir -p .github/workflows
   ```
2. Create `.github/workflows/ci.yml` with the exact content below.
3. Run `npm run lint` locally to confirm no config issues.

**Content to write (copy exactly):**
```yaml
name: CI

on:
  push:
    branches: [dev-claude, master]
  pull_request:
    branches: [dev-claude, master]

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: clawhost
          POSTGRES_PASSWORD: clawhost
          POSTGRES_DB: clawhost
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://clawhost:clawhost@localhost:5432/clawhost
      NEXTAUTH_SECRET: ci-secret-not-real
      NEXTAUTH_URL: http://localhost:3000
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      ENCRYPTION_KEY: ci-encryption-key-not-real-32b
      OPENROUTER_API_KEY: sk-or-ci-not-real
      STRIPE_SECRET_KEY: sk_test_ci_not_real
      STRIPE_WEBHOOK_SECRET: whsec_ci_not_real
      STRIPE_PRICE_ID: price_ci_not_real
      PLATFORM_DEFAULT_MODEL: openrouter/anthropic/claude-sonnet-4-6
      PLATFORM_MONTHLY_CREDITS: "1000"
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy

      - name: Run lint
        run: npm run lint

      - name: Run unit + integration tests
        run: npm run test:run

      - name: Build
        run: npm run build
```

**Verification:**
- `ls .github/workflows/ci.yml` returns the file path.
- `npm run lint` exits with code 0 locally.

**Commit message:** `ci: add GitHub Actions workflow for lint, test, and build`

**Mark complete when:** Both verification items pass.

- [x] M0-9

---

#### TASK M0-10 — Milestone M0 close

**Goal:** Run full verification, confirm M0 is clean, update all truth files.

**Steps:**
1. Run the full verification suite:
   ```bash
   npm run lint && npm run test:run && npm run build
   ```
2. Paste the complete raw output into progress-report.md.
3. If all three pass → continue to step 4. If any fails → STOP EVENT.
4. Update `ADHD.md`: change the "What It Does" section to note that dead components and stale tests have been removed.
5. Update `docs/HANDOFF.md`: set `State: M0 complete, next milestone M1`.
6. Append a milestone summary block to `progress-report.md` (use the template at the top of that file).
7. Update `docs/PROGRESS_LOG.md` with a milestone-close entry.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit code 0 in a single run.

**Commit message:** `chore: close milestone M0 — clean foundation verified`

**Mark complete when:** Full verification passes, all truth files updated, commit landed.

- [x] M0-10

---

### MILESTONE M1 — Schema Cleanup

Goal: Remove dead database fields that belong to the old hosted-agent-first product. No user-visible change.
Exit gate: `npm run lint && npm run test:run && npm run build` all pass. Prisma client regenerated and type-checks clean.

---

#### TASK M1-1 — Create schema cleanup migration

**Goal:** Drop `Instance` fields that belong to the old channel-first / provider-key era. Drop `ProviderConfig` model entirely.

**Precondition:** TASK M0-10 must be marked `[x]` before starting this task.

**Fields to remove from `Instance` model in schema:**
- `channel        String?`
- `channelToken   String?`
- `aiApiKey       String?`
- `telegramChannelId String?`

**Model to remove from schema:**
- `ProviderConfig` (entire model + its enum refs)

**Relation to remove from `Instance`:**
- `providers      ProviderConfig[]`

**Files to touch:**
- `prisma/schema.prisma`

**Preflight:**
```bash
grep -r "ProviderConfig" src/ --include="*.ts" --include="*.tsx"
grep -r "\.channel\b" src/ --include="*.ts" --include="*.tsx"
grep -r "channelToken" src/ --include="*.ts" --include="*.tsx"
grep -r "aiApiKey" src/ --include="*.ts" --include="*.tsx"
grep -r "telegramChannelId" src/ --include="*.ts" --include="*.tsx"
```
For each grep: if it returns matches in non-test `src/` files → STOP. That field is still used. Ask human before removing.

**Steps:**
1. Run all five preflight greps and review results.
2. Edit `prisma/schema.prisma`:
   - Remove the four fields from `Instance` model.
   - Remove `providers ProviderConfig[]` relation from `Instance`.
   - Remove the entire `ProviderConfig` model block.
3. Run `npx prisma migrate dev --name remove_deprecated_instance_fields`
   - This will only work against local Postgres. If you get a connection error → STOP EVENT.
4. Run `npx prisma generate`.
5. Run `npm run build`.
6. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run test:run` exits with code 0.
- `grep "ProviderConfig" prisma/schema.prisma` returns 0 matches.
- `grep "channelToken" prisma/schema.prisma` returns 0 matches.

**Commit message:** `refactor: remove deprecated Instance fields and ProviderConfig model via migration`

**Mark complete when:** All four verification items pass.

- [ ] M1-1

---

#### TASK M1-2 — Update /api/instance PATCH to reject legacy fields

**Goal:** The `PATCH /api/instance` route still accepts `channel`, `channelToken`, `aiApiKey`. These fields no longer exist in the schema. Remove them from the route handler.

**File to touch:** `src/app/api/instance/route.ts`

**Steps:**
1. Open `src/app/api/instance/route.ts`.
2. In the `PATCH` handler, find the destructure:
   ```typescript
   const { channel, channelToken, aiProvider, aiApiKey, activeModel } = await req.json()
   ```
   Change it to:
   ```typescript
   const { aiProvider, activeModel } = await req.json()
   ```
3. Remove any references to `channel`, `channelToken`, `aiApiKey` in the create/update data objects in that function.
4. Run `npm run build`.
5. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run test:run` exits with code 0.
- `grep "channelToken" src/app/api/instance/route.ts` returns 0 matches.

**Commit message:** `fix: remove legacy channel/aiApiKey fields from instance PATCH handler`

**Mark complete when:** All three verification items pass.

- [ ] M1-2

---

#### TASK M1-3 — Update seed file to remove deprecated fields

**Goal:** If `prisma/seed.ts` references any removed fields, clean them up.

**Preflight:**
```bash
grep -n "channelToken\|aiApiKey\|telegramChannelId\|ProviderConfig\|channel:" prisma/seed.ts
```
If grep returns 0 matches → mark this task complete immediately. No file change needed.

**Steps:**
1. Run the preflight grep.
2. If matches exist, edit `prisma/seed.ts` to remove references to the deleted fields.
3. Run `npm run db:seed` (requires local Postgres to be running via `npm run db:up`).
4. Run `npm run test:run`.

**Verification:**
- `npm run test:run` exits with code 0.
- `grep "channelToken" prisma/seed.ts` returns 0 matches.

**Commit message:** `chore: update seed to remove deprecated instance fields`

**Mark complete when:** Both verifications pass (or task was a no-op).

- [ ] M1-3

---

#### TASK M1-4 — Remove Instance.aiApiKey from settings actions

**Goal:** `src/app/dashboard/settings/actions.ts` may reference `aiApiKey` in the deploy or model-save logic. Remove those references.

**Preflight:**
```bash
grep -n "aiApiKey\|channelToken\|telegramChannelId" src/app/dashboard/settings/actions.ts
```
If 0 matches → mark complete immediately.

**Steps:**
1. Run preflight grep.
2. If matches exist, remove those field references from the file.
3. Run `npm run build`.
4. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `grep "aiApiKey" src/app/dashboard/settings/actions.ts` returns 0.

**Commit message:** `fix: remove deprecated aiApiKey references from settings actions`

**Mark complete when:** Both verifications pass (or task was a no-op).

- [ ] M1-4

---

#### TASK M1-5 — Milestone M1 close

**Goal:** Full verification pass, confirm schema is clean.

**Steps:**
1. Run: `npm run lint && npm run test:run && npm run build`
2. Paste full raw output into progress-report.md.
3. Update `docs/HANDOFF.md` to `State: M1 complete, next milestone M2`.
4. Append M1 milestone summary to `progress-report.md`.
5. Append M1 entry to `docs/PROGRESS_LOG.md`.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit 0.

**Commit message:** `chore: close milestone M1 — schema cleanup verified`

- [ ] M1-5

---

### MILESTONE M2 — Workspace Polish

Goal: The workspace shell looks and feels like a real product, not a dev scaffold. A first-time SMB visitor sees value within 3 minutes.
Exit gate: Manual smoke-test of the five scenarios in LOCAL_TESTING_GUIDE.md passes. `npm run lint && npm run test:run && npm run build` pass.

**IMPORTANT FOR CHEAP MODEL:** M2 contains UI-heavy tasks. Each task touches only one specific area. Do not combine them. If a step says "edit `WorkspaceShell.tsx`", only edit that file (and its direct test if it has one).

---

#### TASK M2-1 — Remove dev-grade copy from WorkspaceShell

**Goal:** Remove the "Phase 2" badge, the "Now in ClawHost / Now becoming PageBase" info cards, and the "Phase 2 is now live" description text from the workspace shell. These are internal build notes, not product copy.

**File to touch:** `src/components/dashboard/WorkspaceShell.tsx`

**Steps:**
1. Open `src/components/dashboard/WorkspaceShell.tsx`.
2. Find and remove:
   - The `<Badge variant="secondary">Phase 2</Badge>` element (around line 215).
   - The three `<Card>` blocks containing "Now in ClawHost", "Now becoming PageBase", and "Phase 2 is now live" text (around lines 269–282 and 349–353).
   - The static description paragraph beginning with "Workspace-first product shell is now live here..." (around line 253–256).
   - The "Step 2.1 is now started..." card block in the file section (around lines 288–298).
3. After removal, run `npm run build`.
4. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `grep "Phase 2" src/components/dashboard/WorkspaceShell.tsx` returns 0 matches.
- `grep "Now in ClawHost" src/components/dashboard/WorkspaceShell.tsx` returns 0 matches.

**Commit message:** `refactor: remove dev-grade scaffold copy from workspace shell`

**Mark complete when:** All four verification items pass.

- [ ] M2-1

---

#### TASK M2-2 — Add workspace page rich-text content area (textarea → styled block)

**Goal:** Replace the raw `<textarea>` for page content with a styled, resizable content area that looks intentional. Not a full block editor yet — that is M2-8. This task makes the textarea match the product's visual language.

**File to touch:** `src/components/dashboard/WorkspaceShell.tsx`

**Steps:**
1. Find the `<textarea>` element in `WorkspaceShell.tsx` (the one named `content`).
2. Add these classes to it (keep all existing classes, add these):
   ```
   resize-none leading-relaxed text-base
   ```
3. Change `min-h-[240px]` to `min-h-[320px]`.
4. Add a `spellCheck={false}` prop to the textarea.
5. Run `npm run build`.
6. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `grep "resize-none" src/components/dashboard/WorkspaceShell.tsx` returns 1 match.

**Commit message:** `refactor: style workspace page content textarea for readability`

- [ ] M2-2

---

#### TASK M2-3 — Add page icon to sidebar items and collapse chevron state

**Goal:** The sidebar page tree shows a right-pointing chevron for all items. Make the chevron rotate 90° when a page has children that are visible.

**File to touch:** `src/components/dashboard/WorkspaceShell.tsx`

**Steps:**
1. Locate the `PageTree` function in `WorkspaceShell.tsx`.
2. Convert the `PageTree` component to a client component by extracting it to a new file: `src/components/dashboard/WorkspacePageTree.tsx`.
   - Add `'use client'` at the top of the new file.
   - Move the `PageTree` and `pageIcon` functions into it.
   - Add a `useState` for expanded node tracking.
   - When a node has `children.length > 0`, render a button to toggle expansion.
   - Apply `rotate-90` Tailwind class to the `ChevronRight` icon when expanded.
3. Import `WorkspacePageTree` into `WorkspaceShell.tsx` and replace the old `<PageTree>` call.
4. Run `npm run build`.
5. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `ls src/components/dashboard/WorkspacePageTree.tsx` returns the file.

**Commit message:** `feat: extract collapsible WorkspacePageTree client component`

- [ ] M2-3

---

#### TASK M2-4 — Add workspace page delete (soft-delete) from sidebar

**Goal:** Each non-root page in the sidebar should have an archive/delete button accessible on hover (in addition to the existing full-page Archive button).

**Files to touch:**
- `src/components/dashboard/WorkspacePageTree.tsx` (add hover delete button)
- `src/app/dashboard/workspace/actions.ts` (already has `archiveWorkspacePage` — just confirm it is exported and reuse it)

**Steps:**
1. Open `src/components/dashboard/WorkspacePageTree.tsx`.
2. Inside the node render, add a small `×` button that appears on `group-hover` (the parent `<div>` already has `group` class — if not, add it).
3. The button should call `archiveWorkspacePage` server action (import from `@/app/dashboard/workspace/actions`).
4. Wrap the form exactly like the existing `archiveWorkspacePage` form in `WorkspaceShell.tsx`:
   ```tsx
   <form action={archiveWorkspacePage} className="inline">
     <input type="hidden" name="pageId" value={node.id} />
     <button type="submit" className="opacity-0 group-hover:opacity-100 ml-auto text-muted-foreground hover:text-destructive transition-opacity text-xs px-1">×</button>
   </form>
   ```
5. Run `npm run build`.
6. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `grep "archiveWorkspacePage" src/components/dashboard/WorkspacePageTree.tsx` returns 1+ matches.

**Commit message:** `feat: add per-page hover archive button in workspace sidebar`

- [ ] M2-4

---

#### TASK M2-5 — Add file delete (soft-delete) to workspace file list

**Goal:** Each file in the workspace file list needs a delete action. This is a soft delete (sets `deletedAt`).

**Files to touch:**
- `src/app/dashboard/workspace/actions.ts` (add `deleteWorkspaceFile` server action)
- `src/components/dashboard/WorkspaceShell.tsx` (add delete button to file list items)

**Steps:**
1. Open `src/app/dashboard/workspace/actions.ts`.
2. Add this server action at the bottom of the file:
   ```typescript
   export async function deleteWorkspaceFile(formData: FormData) {
     const session = await auth()
     if (!session?.user?.id) throw new Error('Unauthorized')
     const fileId = String(formData.get('fileId') || '').trim()
     if (!fileId) throw new Error('File id is required')
     const workspace = await getWorkspaceForUser(session.user.id)
     const file = await prisma.workspaceFile.findFirst({
       where: { id: fileId, workspaceId: workspace.id, deletedAt: null },
     })
     if (!file) throw new Error('File not found')
     await prisma.workspaceFile.update({
       where: { id: file.id },
       data: { deletedAt: new Date() },
     })
     revalidateWorkspacePaths()
   }
   ```
3. Open `src/components/dashboard/WorkspaceShell.tsx`.
4. Import `deleteWorkspaceFile` from actions.
5. In the file list render (where each file is shown with a Download link), add a delete form next to the download link:
   ```tsx
   <form action={deleteWorkspaceFile} className="inline">
     <input type="hidden" name="fileId" value={file.id} />
     <button type="submit" className="text-xs text-muted-foreground hover:text-destructive ml-2">Delete</button>
   </form>
   ```
6. Run `npm run build`.
7. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run test:run` exits with code 0.
- `grep "deleteWorkspaceFile" src/app/dashboard/workspace/actions.ts` returns 1+ matches.

**Commit message:** `feat: add workspace file soft-delete action and UI button`

- [ ] M2-5

---

#### TASK M2-6 — Dashboard header model indicator cleanup

**Goal:** The `DashboardHeader` shows the active model name. Clean up the display so it truncates gracefully on mobile and shows only the model short-name (e.g., "Claude Sonnet 4.6" not the full OpenRouter path).

**File to touch:** `src/components/dashboard/DashboardHeader.tsx`

**Steps:**
1. Open `src/components/dashboard/DashboardHeader.tsx`.
2. Find where `activeModel` is rendered.
3. Add a helper to extract the short name:
   ```typescript
   function modelShortName(model: string | null | undefined): string {
     if (!model) return ''
     // e.g. "openrouter/anthropic/claude-sonnet-4-6" → "Claude Sonnet 4.6"
     const parts = model.split('/')
     const slug = parts[parts.length - 1] ?? ''
     return slug
       .replace(/-/g, ' ')
       .replace(/\b\w/g, c => c.toUpperCase())
   }
   ```
4. Replace the raw `{activeModel}` render with `{modelShortName(activeModel)}`.
5. Add `max-w-[120px] truncate` classes to the model display element.
6. Run `npm run build`.
7. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `grep "modelShortName" src/components/dashboard/DashboardHeader.tsx` returns 1+ matches.

**Commit message:** `refactor: display model short-name in dashboard header`

- [ ] M2-6

---

#### TASK M2-7 — Add SMB starter templates on first workspace page creation

**Goal:** When the workspace has no pages beyond the root Home page (i.e., first-run state), show three quick-start template buttons that pre-create a useful page set for SMB users.

**Files to touch:**
- `src/app/dashboard/workspace/actions.ts` (add `createFromTemplate` server action)
- `src/components/dashboard/WorkspaceShell.tsx` (add template picker UI in the empty state)

**Steps:**
1. Open `src/app/dashboard/workspace/actions.ts`.
2. Add this server action:
   ```typescript
   const TEMPLATES: Record<string, { title: string; pageType: string; content: object }> = {
     'client-crm': {
       title: 'Client CRM',
       pageType: 'database',
       content: {
         text: 'Track your clients, contacts, and deal status in one place.',
         database: {
           fields: [
             { id: 'name', name: 'Client Name', type: 'text' },
             { id: 'status', name: 'Status', type: 'select' },
             { id: 'email', name: 'Email', type: 'text' },
             { id: 'value', name: 'Deal Value', type: 'number' },
             { id: 'next', name: 'Next Action', type: 'text' },
           ],
           rows: [],
         },
       },
     },
     'weekly-ops': {
       title: 'Weekly Ops Review',
       pageType: 'standard',
       content: { text: '## Week of [date]\n\n### What shipped\n-\n\n### Blockers\n-\n\n### Next week priorities\n1.\n2.\n3.' },
     },
     'meeting-notes': {
       title: 'Meeting Notes',
       pageType: 'capture',
       content: { text: '## Meeting: [title]\n**Date:** \n**Attendees:** \n\n### Notes\n\n### Action items\n- [ ]' },
     },
   }

   export async function createFromTemplate(formData: FormData) {
     const session = await auth()
     if (!session?.user?.id) throw new Error('Unauthorized')
     const templateKey = String(formData.get('template') || '').trim()
     const template = TEMPLATES[templateKey]
     if (!template) throw new Error('Unknown template')
     const workspace = await getWorkspaceForUser(session.user.id)
     if (!workspace.rootPage) throw new Error('Root page not found')
     const siblingsCount = await prisma.page.count({
       where: { workspaceId: workspace.id, parentId: workspace.rootPage.id, status: 'active' },
     })
     await prisma.page.create({
       data: {
         workspaceId: workspace.id,
         parentId: workspace.rootPage.id,
         title: template.title,
         pageType: template.pageType as 'standard' | 'database' | 'board' | 'dashboard' | 'capture',
         position: siblingsCount,
         content: template.content,
       },
     })
     revalidateWorkspacePaths()
   }
   ```
3. Open `src/components/dashboard/WorkspaceShell.tsx`.
4. Import `createFromTemplate` from actions.
5. In the right panel's empty state (the `<div>` with "Pick a page or create one"), replace it with:
   ```tsx
   <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
     <div>
       <h2 className="text-xl font-semibold">Start your workspace</h2>
       <p className="mt-2 text-sm text-muted-foreground max-w-sm">Create a page above, or pick a starter template to hit the ground running.</p>
     </div>
     <div className="grid gap-3 w-full max-w-sm">
       {[
         { key: 'client-crm', label: 'Client CRM', desc: 'Track clients, deals, and next actions' },
         { key: 'weekly-ops', label: 'Weekly Ops Review', desc: 'Ship notes and priorities every week' },
         { key: 'meeting-notes', label: 'Meeting Notes', desc: 'Fast capture for meetings and calls' },
       ].map(t => (
         <form key={t.key} action={createFromTemplate}>
           <input type="hidden" name="template" value={t.key} />
           <button type="submit" className="w-full rounded-lg border p-4 text-left hover:border-gray-400 transition">
             <p className="font-medium">{t.label}</p>
             <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
           </button>
         </form>
       ))}
     </div>
   </div>
   ```
6. Run `npm run build`.
7. Run `npm run test:run`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run test:run` exits with code 0.
- `grep "createFromTemplate" src/components/dashboard/WorkspaceShell.tsx` returns 1+ matches.

**Commit message:** `feat: add SMB starter templates to workspace empty state`

- [ ] M2-7

---

#### TASK M2-8 — Milestone M2 close

**Goal:** Full verification pass. Update all truth files.

**Steps:**
1. Run: `npm run lint && npm run test:run && npm run build`
2. Paste full raw output into progress-report.md.
3. Update `docs/HANDOFF.md` to `State: M2 complete, next milestone M3`.
4. Update `ADHD.md` to reflect the new workspace polish (remove Phase 2 badge note, add template starter note).
5. Append M2 milestone summary to `progress-report.md`.
6. Append M2 entry to `docs/PROGRESS_LOG.md`.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit 0.

**Commit message:** `chore: close milestone M2 — workspace polish verified`

- [ ] M2-8

---

### MILESTONE M3 — AI as Command Palette

Goal: The AI assistant reads the user's workspace and writes output back into it. Chat is not a page — it is a command palette. This is the differentiator.
Exit gate: Manual test of "Cmd-K → summarize this page → output written into a new page" passes. `npm run lint && npm run test:run && npm run build` pass.

**IMPORTANT FOR CHEAP MODEL:** M3 requires creating new files and a new API route. Follow each step exactly. Do not change architecture patterns (server actions for mutations, API routes for async operations). If a step is ambiguous, STOP.

---

#### TASK M3-1 — Add workspace full-text search index (Postgres tsvector)

**Goal:** Add a Postgres full-text search index on `Page.title` and `Page.content` text so AI context retrieval is fast without a vector database.

**Files to touch:**
- `prisma/schema.prisma` (add `@@index` with raw SQL note)
- A new migration (created by Prisma)

**Steps:**
1. Open `prisma/schema.prisma`.
2. In the `Page` model, confirm the existing indexes. They should be:
   ```
   @@index([workspaceId, status, position])
   @@index([parentId, position])
   ```
3. Run the migration to add a GIN index manually:
   ```bash
   npx prisma migrate dev --name add_page_fulltext_index
   ```
   This creates a new migration file. Then open the generated migration SQL file (under `prisma/migrations/<timestamp>_add_page_fulltext_index/migration.sql`) and **append** these lines:
   ```sql
   CREATE INDEX IF NOT EXISTS page_fulltext_idx
   ON "Page" USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content::text, '')));
   ```
4. Apply the migration (it was already run in step 3 via `migrate dev`, but re-run to apply the manual SQL addition):
   ```bash
   npx prisma migrate dev --name add_page_fulltext_index
   ```
   Note: If Prisma says "already up to date", run:
   ```bash
   npx prisma db execute --file prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql
   ```
5. Run `npx prisma generate`.
6. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.
- `ls prisma/migrations/ | grep add_page_fulltext` returns a directory name.

**Commit message:** `feat: add Postgres full-text search index on workspace pages`

- [ ] M3-1

---

#### TASK M3-2 — Add workspace context retrieval library function

**Goal:** Add a server-side function that retrieves the most relevant workspace pages for a given query string. This is what the AI will call to get context before answering.

**File to create:** `src/lib/workspace-context.ts`

**Content to write (copy exactly):**
```typescript
import { prisma } from '@/lib/prisma'

export interface WorkspaceContextChunk {
  pageId: string
  pageTitle: string
  pageType: string
  snippet: string
}

/**
 * Retrieve the most relevant workspace pages for a query.
 * Uses Postgres full-text search. Returns up to `limit` results.
 * Falls back to recency-ordered pages if query is empty.
 */
export async function retrieveWorkspaceContext(
  workspaceId: string,
  query: string,
  limit = 5
): Promise<WorkspaceContextChunk[]> {
  if (!query.trim()) {
    // No query: return the most recently updated pages as context
    const pages = await prisma.page.findMany({
      where: { workspaceId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: { id: true, title: true, pageType: true, content: true },
    })
    return pages.map(p => ({
      pageId: p.id,
      pageTitle: p.title,
      pageType: p.pageType,
      snippet: extractTextSnippet(p.content, 300),
    }))
  }

  // Full-text search
  const results = await prisma.$queryRaw<
    { id: string; title: string; pageType: string; content: unknown }[]
  >`
    SELECT id, title, "pageType", content
    FROM "Page"
    WHERE "workspaceId" = ${workspaceId}
      AND status = 'active'
      AND to_tsvector('english',
            coalesce(title, '') || ' ' || coalesce(content::text, ''))
          @@ plainto_tsquery('english', ${query})
    ORDER BY ts_rank(
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content::text, '')),
      plainto_tsquery('english', ${query})
    ) DESC
    LIMIT ${limit}
  `

  return results.map(r => ({
    pageId: r.id,
    pageTitle: r.title,
    pageType: r.pageType,
    snippet: extractTextSnippet(r.content, 300),
  }))
}

function extractTextSnippet(content: unknown, maxLength: number): string {
  if (!content || typeof content !== 'object') return ''
  const obj = content as Record<string, unknown>
  const text = typeof obj.text === 'string' ? obj.text : ''
  return text.slice(0, maxLength).trim()
}
```

**Steps:**
1. Create the file with the exact content above.
2. Run `npm run build`.
3. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `ls src/lib/workspace-context.ts` returns the file path.

**Commit message:** `feat: add workspace context retrieval library (Postgres full-text)`

- [ ] M3-2

---

#### TASK M3-3 — Add /api/ai/command route

**Goal:** Add a server-side API route that accepts a user command string, retrieves workspace context, calls OpenRouter, and returns the AI response. This is the backend for the Cmd-K palette.

**File to create:** `src/app/api/ai/command/route.ts`

**Steps:**
1. Create directory: `mkdir -p src/app/api/ai`
2. Create the file `src/app/api/ai/command/route.ts` with the exact content below.
3. Run `npm run build`.
4. Run `npm run lint`.

**Content to write (copy exactly):**
```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { getWorkspaceForUser } from '@/lib/workspace'
import { retrieveWorkspaceContext } from '@/lib/workspace-context'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Credit gate
    if (user.creditsBalance <= 0) {
      return NextResponse.json({ error: 'No credits remaining. Please renew your subscription.' }, { status: 402 })
    }

    const body = await req.json()
    const command = typeof body.command === 'string' ? body.command.trim() : ''
    const targetPageId = typeof body.targetPageId === 'string' ? body.targetPageId : null

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    const workspace = await getWorkspaceForUser(session.user.id)
    const context = await retrieveWorkspaceContext(workspace.id, command, 5)

    const contextBlock = context.length > 0
      ? context.map(c => `[Page: ${c.pageTitle} (${c.pageType})]\n${c.snippet}`).join('\n\n---\n\n')
      : 'No relevant workspace pages found.'

    const instance = await prisma.instance.findUnique({
      where: { userId: session.user.id },
      select: { activeModel: true },
    })
    const model = instance?.activeModel ?? env.PLATFORM_DEFAULT_MODEL

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'ClawHost Workspace',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are the AI assistant for a business workspace. You have access to the user's workspace pages below. When answering, reference specific pages when relevant. Be concise and actionable. Output plain text or markdown only.\n\nWORKSPACE CONTEXT:\n${contextBlock}`,
          },
          { role: 'user', content: command },
        ],
        max_tokens: 1000,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('OpenRouter error:', errText)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const aiData = await aiResponse.json()
    const answer = aiData.choices?.[0]?.message?.content ?? ''

    // Decrement credits by 1 per command call
    await prisma.user.update({
      where: { id: session.user.id },
      data: { creditsBalance: { decrement: 1 } },
    })

    return NextResponse.json({
      answer,
      contextUsed: context.map(c => ({ pageId: c.pageId, pageTitle: c.pageTitle })),
      targetPageId,
    })
  } catch (error) {
    console.error('AI command error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `ls src/app/api/ai/command/route.ts` returns the file path.

**Commit message:** `feat: add /api/ai/command route with workspace context and credit gate`

- [ ] M3-3

---

#### TASK M3-4 — Add CommandPalette client component

**Goal:** Create the Cmd-K command palette component that users open to run AI commands from anywhere in the workspace.

**File to create:** `src/components/dashboard/CommandPalette.tsx`

**Steps:**
1. Create the file with the exact content below.
2. Run `npm run build`.
3. Run `npm run lint`.

**Content to write (copy exactly):**
```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface CommandPaletteProps {
  targetPageId?: string
  onResult?: (result: string) => void
}

export function CommandPalette({ targetPageId, onResult }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<{ pageId: string; pageTitle: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setResult(null)
        setError(null)
        setCommand('')
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleRun() {
    if (!command.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    setContextUsed([])
    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, targetPageId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setResult(data.answer ?? '')
      setContextUsed(data.contextUsed ?? [])
      onResult?.(data.answer ?? '')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:border-gray-400 transition"
        title="Open AI command palette (Cmd+K)"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Ask AI</span>
        <kbd className="ml-2 hidden text-xs text-muted-foreground sm:inline">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRun() }}
            placeholder="Ask about your workspace… (e.g. Summarize my client notes)"
            className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">{result}</div>
              {contextUsed.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Sources: {contextUsed.map(c => c.pageTitle).join(', ')}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setResult(null); setCommand('') }}>
                  New command
                </Button>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quick commands</p>
              {[
                'Summarize this page',
                'What are my open action items?',
                'Draft a weekly update from my notes',
                'List all clients with pending follow-ups',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setCommand(suggestion)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {!result && (
          <div className="border-t px-4 py-3 flex justify-end">
            <Button onClick={handleRun} disabled={loading || !command.trim()} size="sm">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
```

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `ls src/components/dashboard/CommandPalette.tsx` returns the file path.

**Commit message:** `feat: add CommandPalette client component (Cmd+K AI palette)`

- [ ] M3-4

---

#### TASK M3-5 — Wire CommandPalette into DashboardHeader

**Goal:** Mount the `CommandPalette` in the dashboard header so it is accessible from every workspace page.

**File to touch:** `src/components/dashboard/DashboardHeader.tsx`

**Steps:**
1. Open `src/components/dashboard/DashboardHeader.tsx`.
2. At the top, add the import:
   ```typescript
   import { CommandPalette } from '@/components/dashboard/CommandPalette'
   ```
3. Find the nav element or the right side of the header where the model name and sign-out button live.
4. Add `<CommandPalette />` just before the sign-out button (or model indicator), so it renders as a button in the header bar.
5. Run `npm run build`.
6. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `npm run lint` exits with code 0.
- `grep "CommandPalette" src/components/dashboard/DashboardHeader.tsx` returns 1+ matches.

**Commit message:** `feat: wire CommandPalette into DashboardHeader`

- [ ] M3-5

---

#### TASK M3-6 — Add credit decrement integration test

**Goal:** Add a Vitest test that verifies the `/api/ai/command` route decrements `creditsBalance` by 1 and gates users with 0 credits.

**File to create:** `tests/integration/api/ai-command.test.ts`

**Steps:**
1. Create the file with the content below.
2. Run `npm run test:run`.

**Content to write (copy exactly):**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the auth and prisma deps
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    instance: { findUnique: vi.fn() },
    page: { findMany: vi.fn(), findFirst: vi.fn() },
    workspace: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/workspace', () => ({
  getWorkspaceForUser: vi.fn(),
}))
vi.mock('@/lib/workspace-context', () => ({
  retrieveWorkspaceContext: vi.fn().mockResolvedValue([]),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('POST /api/ai/command credit gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 402 when user has 0 credits', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      creditsBalance: 0,
    } as never)

    const { POST } = await import('@/app/api/ai/command/route')
    const req = new Request('http://localhost/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'summarize my notes' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(402)
    const body = await res.json()
    expect(body.error).toMatch(/credits/i)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/ai/command/route')
    const req = new Request('http://localhost/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'summarize my notes' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
```

**Verification:**
- `npm run test:run` exits with code 0.
- `ls tests/integration/api/ai-command.test.ts` returns the file path.

**Commit message:** `test: add integration tests for /api/ai/command credit gate`

- [ ] M3-6

---

#### TASK M3-7 — Milestone M3 close

**Goal:** Full verification pass. Update all truth files.

**Steps:**
1. Run: `npm run lint && npm run test:run && npm run build`
2. Paste full raw output into progress-report.md.
3. Update `docs/HANDOFF.md` to `State: M3 complete, next milestone M4`.
4. Update `ADHD.md` to reflect command palette and AI integration.
5. Append M3 milestone summary to `progress-report.md`.
6. Append M3 entry to `docs/PROGRESS_LOG.md`.
7. Add a `docs/DECISIONS.md` entry for the "no vector DB, use Postgres FTS" choice.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit 0.

**Commit message:** `chore: close milestone M3 — AI command palette verified`

- [ ] M3-7

---

### MILESTONE M4 — Production Readiness

Goal: The app is safe, observable, and hardened enough to accept real paying users.
Exit gate: Checklist below passes. `npm run lint && npm run test:run && npm run build` pass.

---

#### TASK M4-1 — Add /status health-check route

**Goal:** Create a `/status` page that surfaces: app up, DB up, credits granted in last 24h.

**Files to create:**
- `src/app/status/page.tsx`
- `src/app/api/status/route.ts`

**Steps:**
1. Create `src/app/api/status/route.ts` with exact content:
   ```typescript
   import { NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'

   export async function GET() {
     try {
       await prisma.$queryRaw`SELECT 1`
       const creditsGrantedLast24h = await prisma.user.aggregate({
         _sum: { creditsBalance: true },
         where: { updatedAt: { gte: new Date(Date.now() - 86400_000) } },
       })
       return NextResponse.json({
         status: 'ok',
         db: 'ok',
         creditsGrantedLast24h: creditsGrantedLast24h._sum.creditsBalance ?? 0,
         timestamp: new Date().toISOString(),
       })
     } catch {
       return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 })
     }
   }
   ```
2. Create `src/app/status/page.tsx` with exact content:
   ```typescript
   export const dynamic = 'force-dynamic'

   async function getStatus() {
     try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/status`, { cache: 'no-store' })
       return res.json()
     } catch {
       return { status: 'error' }
     }
   }

   export default async function StatusPage() {
     const data = await getStatus()
     return (
       <div className="mx-auto max-w-md p-8 space-y-4">
         <h1 className="text-2xl font-bold">System Status</h1>
         <div className="space-y-2 rounded-lg border p-4 text-sm">
           <div className="flex justify-between"><span>App</span><span className={data.status === 'ok' ? 'text-green-600' : 'text-red-600'}>{data.status === 'ok' ? '✓ Operational' : '✗ Degraded'}</span></div>
           <div className="flex justify-between"><span>Database</span><span className={data.db === 'ok' ? 'text-green-600' : 'text-red-600'}>{data.db === 'ok' ? '✓ Operational' : '✗ Unreachable'}</span></div>
           <div className="flex justify-between"><span>Updated</span><span className="text-muted-foreground">{data.timestamp ?? '—'}</span></div>
         </div>
       </div>
     )
   }
   ```
3. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.
- `ls src/app/api/status/route.ts src/app/status/page.tsx` returns both files.

**Commit message:** `feat: add /status health-check page and API route`

- [ ] M4-1

---

#### TASK M4-2 — Add rate limiting to /api/ai/command

**Goal:** The AI command route must be rate-limited per user (max 20 requests per minute) to prevent credit abuse.

**File to touch:** `src/app/api/ai/command/route.ts`

**Steps:**
1. Open `src/app/api/ai/command/route.ts`.
2. At the top, add the import:
   ```typescript
   import { checkAuthRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
   ```
3. After the auth check and before the credit check, add:
   ```typescript
   const rateLimitCheck = checkAuthRateLimit(`ai:${session.user.id}`)
   if (!rateLimitCheck.allowed) {
     return createRateLimitResponse(rateLimitCheck.resetAt)
   }
   ```
4. Open `src/lib/rate-limit.ts` and confirm `checkAuthRateLimit` exists. If it does not exist with that name, find the correct function name in that file and use it. Do not rename it — adapt the import.
5. Run `npm run build`.
6. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `grep "rate" src/app/api/ai/command/route.ts` returns 1+ matches.

**Commit message:** `sec: add rate limiting to AI command route`

- [ ] M4-2

---

#### TASK M4-3 — Add CSP and security headers to Next.js config

**Goal:** Add security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) to all responses.

**File to touch:** `next.config.ts`

**Steps:**
1. Open `next.config.ts`.
2. Add a `headers()` function that returns security headers. Wrap the existing config export, do not replace it.
3. The headers to add:
   ```typescript
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           { key: 'X-Frame-Options', value: 'DENY' },
           { key: 'X-Content-Type-Options', value: 'nosniff' },
           { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
           { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
         ],
       },
     ]
   },
   ```
   Note: Do NOT add a strict CSP yet — it requires extensive testing for third-party scripts. Leave a comment: `// TODO M5: add Content-Security-Policy after testing all third-party integrations`.
4. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.
- `grep "X-Frame-Options" next.config.ts` returns 1+ matches.

**Commit message:** `sec: add security headers to Next.js config`

- [ ] M4-3

---

#### TASK M4-4 — Add legal stub pages (ToS and Privacy)

**Goal:** Create minimal Terms of Service and Privacy Policy pages so the app can accept real users.

**Files to create:**
- `src/app/legal/terms/page.tsx`
- `src/app/legal/privacy/page.tsx`

**Steps:**
1. Create `src/app/legal/terms/page.tsx`:
   ```typescript
   export default function TermsPage() {
     return (
       <div className="mx-auto max-w-3xl px-4 py-16 prose">
         <h1>Terms of Service</h1>
         <p><em>Last updated: {new Date().getFullYear()}</em></p>
         <p>By using ClawHost, you agree to use the service lawfully and in accordance with these terms. We reserve the right to suspend accounts that violate these terms.</p>
         <h2>Use of Service</h2>
         <p>ClawHost provides AI-powered workspace tools for business use. You are responsible for content you create. Do not use the service for illegal purposes.</p>
         <h2>Subscription and Billing</h2>
         <p>Subscriptions are billed monthly via Stripe. Cancellation takes effect at the end of the billing period. No refunds for partial months.</p>
         <h2>Data</h2>
         <p>Your workspace data is stored securely. We do not sell your data. See our Privacy Policy for details.</p>
         <h2>Limitation of Liability</h2>
         <p>ClawHost is provided as-is. We are not liable for data loss or business interruption.</p>
         <h2>Contact</h2>
         <p>Questions? Email us at support@clawhost.com.</p>
       </div>
     )
   }
   ```
2. Create `src/app/legal/privacy/page.tsx`:
   ```typescript
   export default function PrivacyPage() {
     return (
       <div className="mx-auto max-w-3xl px-4 py-16 prose">
         <h1>Privacy Policy</h1>
         <p><em>Last updated: {new Date().getFullYear()}</em></p>
         <p>ClawHost collects only what is necessary to provide the service.</p>
         <h2>What we collect</h2>
         <ul>
           <li>Email address (for account and billing)</li>
           <li>Workspace content you create</li>
           <li>Usage data (credits consumed, session activity)</li>
         </ul>
         <h2>What we do not collect</h2>
         <ul>
           <li>We do not sell your data to third parties.</li>
           <li>We do not use your workspace content to train AI models.</li>
         </ul>
         <h2>Third parties</h2>
         <p>We use Stripe for billing and OpenRouter for AI model access. Their privacy policies apply to data they process.</p>
         <h2>Data retention</h2>
         <p>You may delete your account at any time. Workspace data is deleted within 30 days of account deletion.</p>
         <h2>Contact</h2>
         <p>Privacy questions: privacy@clawhost.com</p>
       </div>
     )
   }
   ```
3. Run `npm run build`.

**Verification:**
- `npm run build` exits with code 0.
- `ls src/app/legal/terms/page.tsx src/app/legal/privacy/page.tsx` returns both files.

**Commit message:** `feat: add legal stub pages (ToS and Privacy)`

- [ ] M4-4

---

#### TASK M4-5 — Add footer links to auth pages and public pages

**Goal:** Add links to Terms and Privacy in the registration page footer.

**File to touch:** `src/app/(auth)/register/page.tsx`

**Steps:**
1. Open `src/app/(auth)/register/page.tsx`.
2. Find the bottom of the register form JSX.
3. Add, after the form:
   ```tsx
   <p className="mt-6 text-center text-xs text-muted-foreground">
     By registering you agree to our{' '}
     <a href="/legal/terms" className="underline hover:text-foreground">Terms of Service</a>
     {' '}and{' '}
     <a href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
   </p>
   ```
4. Run `npm run build`.
5. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `grep "legal/terms" src/app/(auth)/register/page.tsx` returns 1+ matches.

**Commit message:** `feat: add ToS and Privacy links to register page`

- [ ] M4-5

---

#### TASK M4-6 — Milestone M4 close

**Goal:** Full verification pass. Update all truth files.

**Steps:**
1. Run: `npm run lint && npm run test:run && npm run build`
2. Paste full raw output into progress-report.md.
3. Update `docs/HANDOFF.md` to `State: M4 complete, next milestone M5`.
4. Update `ADHD.md` to reflect production-readiness additions.
5. Append M4 milestone summary to `progress-report.md`.
6. Append M4 entry to `docs/PROGRESS_LOG.md`.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit 0.

**Commit message:** `chore: close milestone M4 — production readiness verified`

- [ ] M4-6

---

### MILESTONE M5 — Launch

Goal: The full user journey works in production: signup → Stripe → credits → AI command → workspace value. All truth files are current. `docs/LAUNCH_PROOF.md` exists and is signed off.
Exit gate: Human signs off on `docs/LAUNCH_PROOF.md`.

---

#### TASK M5-1 — Add launch proof document (stub)

**Goal:** Create `docs/LAUNCH_PROOF.md` with the test matrix that must pass before going live.

**File to create:** `docs/LAUNCH_PROOF.md`

**Content to write (copy exactly):**
```markdown
# Launch Proof

> This document is filled in by a human with real test results before any public launch announcement.
> Each row must be manually verified in the production environment, not on localhost.

## Required flows (all must be ✅ before launch)

| # | Flow | Steps | Result | Date | Verified by |
|---|---|---|---|---|---|
| 1 | Signup | New user registers via /register | ✅/❌ | | |
| 2 | Onboarding | Picks model, reaches /dashboard/workspace | ✅/❌ | | |
| 3 | Workspace bootstrap | Home page + Inbox/Projects/Notes folders exist | ✅/❌ | | |
| 4 | Stripe checkout | Real test card, subscription created | ✅/❌ | | |
| 5 | Credits granted | After payment, creditsBalance > 0 | ✅/❌ | | |
| 6 | AI command | Cmd+K → command → response returned | ✅/❌ | | |
| 7 | Credit decrement | After AI command, creditsBalance decremented by 1 | ✅/❌ | | |
| 8 | File upload | Upload a file, appears in workspace | ✅/❌ | | |
| 9 | File download | Download the uploaded file | ✅/❌ | | |
| 10 | Logout | User logs out, lands on /login | ✅/❌ | | |
| 11 | Protected route | Visiting /dashboard while logged out redirects to /login | ✅/❌ | | |
| 12 | EN/FR locale | Switch locale, confirm workspace copy changes | ✅/❌ | | |
| 13 | /status | /status page shows app=ok, db=ok | ✅/❌ | | |
| 14 | ToS and Privacy | Links in register page work | ✅/❌ | | |

## Sign-off

**Human sign-off required before launch:**
- [ ] All 14 flows above are ✅
- [ ] Stripe webhook is configured with production STRIPE_WEBHOOK_SECRET
- [ ] DATABASE_URL points to production Postgres
- [ ] NEXTAUTH_URL matches the public production URL
- [ ] OPENROUTER_API_KEY is the production key
- [ ] AUTH_TRUST_HOST=true is set in production env
- [ ] ENCRYPTION_KEY is set (32 bytes, random, never committed)
- [ ] `npm run build` passes on the production host
```

**Steps:**
1. Create `docs/LAUNCH_PROOF.md` with the exact content above.
2. Run `npm run lint`.

**Verification:**
- `npm run lint` exits with code 0.
- `ls docs/LAUNCH_PROOF.md` returns the file path.

**Commit message:** `docs: add launch proof checklist template`

- [ ] M5-1

---

#### TASK M5-2 — Add in-app feedback button to DashboardHeader

**Goal:** A "Feedback" link in the header opens a mailto or external form link so users can report issues.

**File to touch:** `src/components/dashboard/DashboardHeader.tsx`

**Steps:**
1. Open `src/components/dashboard/DashboardHeader.tsx`.
2. Find the header nav area.
3. Add a small Feedback link:
   ```tsx
   <a
     href="mailto:feedback@clawhost.com?subject=ClawHost Feedback"
     className="text-sm text-muted-foreground hover:text-foreground transition"
     target="_blank"
     rel="noopener noreferrer"
   >
     Feedback
   </a>
   ```
4. Run `npm run build`.
5. Run `npm run lint`.

**Verification:**
- `npm run build` exits with code 0.
- `grep "feedback" src/components/dashboard/DashboardHeader.tsx` returns 1+ matches.

**Commit message:** `feat: add feedback link to dashboard header`

- [ ] M5-2

---

#### TASK M5-3 — Update README.md to reflect current product truth

**Goal:** `README.md` must describe the actual product (workspace OS for SMBs) not the old "host an agent in 60s" framing.

**File to touch:** `README.md`

**Steps:**
1. Open `README.md`.
2. Replace the "Current Product Truth" and "Current App Shape" sections with content that describes the current workspace-first SMB product:
   - What it is: AI-powered workspace for SMBs (pages, databases, files, AI command palette)
   - What it has: workspace shell, typed pages, database pages, file layer, Cmd-K AI, Stripe credits, EN/FR
   - What it does not have yet: public API, teams/RBAC, mobile app
3. Update the "API Surface" table to match what actually exists: `/api/auth/*`, `/api/workspace/files`, `/api/ai/command`, `/api/stripe/*`, `/api/instance`, `/api/skills`, `/api/status`.
4. Remove references to "hosted agent provisioning" as a current user-facing feature.
5. Run `npm run lint`.

**Verification:**
- `npm run lint` exits with code 0.
- `grep "AI-powered workspace" README.md` returns 1+ matches.

**Commit message:** `docs: update README to reflect workspace-first SMB product truth`

- [ ] M5-3

---

#### TASK M5-4 — Final ADHD.md update

**Goal:** `ADHD.md` must reflect the fully launched state.

**File to touch:** `ADHD.md`

**Steps:**
1. Open `ADHD.md`.
2. Update the "What It Does" section to reflect all M0–M4 completions.
3. Update the "What It Will Do" checklist — mark completed items `[x]`.
4. Add the AI command palette, credit metering, status page, and legal pages to the "What It Does" list.
5. Run `npm run lint`.

**Verification:**
- `npm run lint` exits with code 0.
- `grep "command palette" ADHD.md` returns 1+ matches.

**Commit message:** `docs: update ADHD.md to reflect M5 launch state`

- [ ] M5-4

---

#### TASK M5-5 — Milestone M5 close (FINAL)

**Goal:** Full final verification. Hand off to human for production deployment.

**Steps:**
1. Run: `npm run lint && npm run test:run && npm run build`
2. Paste full raw output into progress-report.md.
3. Update `docs/HANDOFF.md`:
   ```
   State: dev-claude is launch-ready. All milestones M0–M5 complete.
   Next step: Human deploys to production, fills in docs/LAUNCH_PROOF.md.
   Next task for agent: none until human signs off on LAUNCH_PROOF.md.
   ```
4. Append M5 milestone summary and final session entry to `progress-report.md`.
5. Append M5 entry to `docs/PROGRESS_LOG.md`.

**Verification:**
- `npm run lint && npm run test:run && npm run build` all exit 0.

**Commit message:** `chore: close milestone M5 — dev-claude is launch-ready`

- [ ] M5-5

---

## APPENDIX A — docs/AGENT_PIPELINE.md

> Already created at `docs/AGENT_PIPELINE.md` in this repo. Read that file directly.

---

## APPENDIX B — docs/HANDOFF.md template

> Already created at `docs/HANDOFF.md`. Overwrite it at the end of each session using the template shown in that file.

---

## APPENDIX C — docs/DECISIONS.md

> Already created at `docs/DECISIONS.md`. Append new entries using the template at the bottom of that file.

---

## APPENDIX D — docs/PROGRESS_LOG.md

> Already created at `docs/PROGRESS_LOG.md`. Append milestone entries using the template at the top of that file.

---

## APPENDIX E — AGENTS.md

> Already created at `AGENTS.md` in this repo. Do not modify it unless instructed by the human.

---

## APPENDIX F — CLAUDE.md

> Already created at `CLAUDE.md` in this repo. Do not modify it unless instructed by the human.

---

## APPENDIX G — tests/e2e/onboarding/model-select.spec.ts

> Content is embedded directly in TASK M0-7 above. Copy from there.

---

## APPENDIX H — tests/e2e/workspace/workspace-shell.spec.ts

> Content is embedded directly in TASK M0-8 above. Copy from there.

---

## APPENDIX I — .github/workflows/ci.yml

> Content is embedded directly in TASK M0-9 above. Copy from there.

---

## APPENDIX J — Milestone summaries

M0: Clean foundation — dead code gone, stale tests replaced, CI added.
M1: Schema cleanup — deprecated DB fields removed, Prisma client updated.
M2: Workspace polish — dev copy gone, collapsible sidebar, file delete, SMB templates.
M3: AI command palette — Postgres FTS, /api/ai/command, Cmd-K UI, credit metering.
M4: Production readiness — /status, rate limiting on AI, security headers, legal stubs.
M5: Launch — launch proof doc, feedback link, README truth, final ADHD update.

---

## APPENDIX K — Cheap-model boot prompt (paste into OpenRouter)

### For `deepseek/deepseek-v3.2` (preferred)

```
You are an execution agent for the ClawHost software repo. You operate on the branch `dev-claude`.

Your ONLY job is to execute the next unchecked task in `plan-claude.md`.

STARTUP (do this before anything else):
1. Read `plan-claude.md` from top to bottom.
2. Read the last 3 entries in `progress-report.md`.
3. Read `docs/HANDOFF.md`.
4. Find the first line in plan-claude.md that reads `- [ ] M<number>-<number>`.
5. That is your task. Execute ONLY that task.

EXECUTION RULES:
- Follow the Steps section of the task exactly, in order.
- Run only the shell commands listed in the task or in the ALLOWED SHELL COMMANDS section.
- Do not install new npm packages.
- Do not modify files under docs/archive/.
- Do not run: git push --force, git reset --hard, git rebase -i, git commit --amend (on pushed commits), prisma migrate reset.
- One task = one commit. Do not batch multiple tasks into one commit.

AFTER THE TASK:
- Run the Verification commands listed in the task.
- If verification passes: mark the task `[x]` in plan-claude.md, append the session entry to progress-report.md (using the template at the top of that file), commit with the exact message from the task, push, overwrite docs/HANDOFF.md with current state, then STOP.
- If verification fails OR any STOP trigger fires: write a STOP EVENT entry in progress-report.md and stop. Do NOT attempt to fix the failure. Report it to the human.

You are NOT allowed to:
- skip tasks
- reorder tasks
- invent tasks not in plan-claude.md
- mark a task [x] without pasting raw verification output in progress-report.md
- do "helpful" extra work beyond the current task
- guess when instructions are ambiguous — stop and report instead
```

### For `minimax/minimax-m2.7` (fallback — use if DeepSeek is unavailable)

```
You are a code execution agent. Work on the ClawHost repo, branch: dev-claude.

BEFORE YOU DO ANYTHING:
Read these files in this exact order:
1. plan-claude.md (full file)
2. progress-report.md (last 3 entries)
3. docs/HANDOFF.md

FIND YOUR TASK:
Search plan-claude.md for the first line that looks like: - [ ] M0-1
That is your task ID. Read that entire task section.

DO THE TASK:
Follow the Steps exactly. Run only the commands listed. Do not invent steps.

WHEN DONE:
Run the Verification commands. If they pass: mark [x] in plan-claude.md, write a task entry in progress-report.md with the raw terminal output pasted in, commit with the message from the task, push, update docs/HANDOFF.md, stop.

IF ANYTHING FAILS: write STOP EVENT in progress-report.md. Do not try to fix it. Stop.

NEVER:
- batch tasks
- skip tasks
- run git push --force
- install npm packages
- edit docs/archive/
- mark a task done without pasting the verification output
```

---

## APPENDIX L — Forbidden operations reference card

```
NEVER RUN:
  git push --force
  git push -f
  git reset --hard     (on pushed branches)
  git rebase -i
  git commit --amend   (if commit was already pushed)
  git branch -D        (without --merged check)
  prisma migrate reset
  npm install <anything>  (without DECISIONS.md entry first)

NEVER COMMIT:
  .env
  .env.local
  tsconfig.tsbuildinfo
  .next/
  coverage/
  playwright-report/
  test-results/

NEVER TOUCH:
  docs/archive/**      (frozen directory)
```

---

## APPENDIX M — Verification command reference

Every command the cheap model is permitted to run for verification purposes:

```bash
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
grep -r "<pattern>" src/ --include="*.ts" --include="*.tsx"

# Prisma (only when task explicitly says to run)
npx prisma generate
npx prisma migrate dev --name <name>

# Playwright (only when task explicitly says to run)
npx playwright test <spec-file> --project=chromium

# Directory setup (only when task says to)
mkdir -p <path>

# File deletion (only when preflight confirms safe)
rm <file>
rm -rf <directory>
rmdir <empty-directory>
```
