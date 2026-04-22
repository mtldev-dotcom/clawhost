# Local Testing Guide

This file is the current verification truth source.

## Core Verification Commands

```bash
npm run test:run
npm run build
npx playwright test tests/e2e/auth/login.spec.ts tests/e2e/auth/signup.spec.ts tests/e2e/auth/logout.spec.ts tests/e2e/onboarding/wizard.spec.ts tests/e2e/dashboard/settings.spec.ts --project=chromium --workers=2
```

## Current High-Value Smoke Path

### 1. Fresh signup -> onboarding -> workspace
- open `/register`
- create a new account
- confirm redirect to `/onboarding`
- pick a default platform-managed model
- continue into `/dashboard/workspace`
- confirm the workspace shell loads

### 2. Login -> workspace
- open `/login`
- sign in with an existing account
- confirm redirect into the authenticated app
- confirm `/dashboard/workspace` loads

### 3. Workspace shell bootstrap
- open `/dashboard/workspace`
- confirm workspace auto-bootstrap happened
- confirm root folders exist: Inbox, Projects, Notes
- confirm the root Home page exists

### 4. Pages and database behavior
- create a standard page
- edit title/content and refresh to confirm persistence
- create a database page
- add a field
- add a row
- confirm the row appears in the table view
- create Board / Dashboard / Capture pages and confirm they open without crashing the shell

### 5. Workspace files
- upload a small text file from the workspace UI
- confirm the file appears in the root list
- use the download link and confirm the file is returned
- search by file name or description and confirm the file appears in results

### 6. Settings
- open `/dashboard/settings`
- confirm subscription + credits UI renders
- change the default model and confirm it persists after refresh
- click `Connect Telegram` and confirm the shared-bot deep link opens
- confirm deploy stays gated when no active subscription/credits exist

### 7. Logout
- log out from the authenticated app
- confirm you land on `/login`
- confirm protected routes redirect back to login when signed out

### 8. Language smoke check
- switch locale if the UI exposes it
- confirm auth/workspace/settings copy changes cleanly
- watch for missing translations or mixed-language screens

## Manual API Checks

### Upload file
```bash
curl -X POST http://localhost:3000/api/workspace/files \
  -F "file=@./README.md" \
  -F "description=test upload" \
  -b "authjs.session-token=..."
```

### List files
```bash
curl "http://localhost:3000/api/workspace/files" \
  -b "authjs.session-token=..."
```

## Current Expected Truth

- onboarding is now platform-managed model selection, not user-pasted provider-key setup
- onboarding lands in `/dashboard/workspace`
- workspace is the primary merged-app shell
- settings now shift toward platform-managed OpenRouter + subscription credits + shared Telegram linking
- logout behavior and auth flows were revalidated against the current UI
- workspace file list/upload/download/search are now live in code

## Required Verification After Core Changes

### Workspace or page changes
- `npm run test:run`
- relevant manual workspace smoke checks
- `npm run build`

### File-system changes
- `npm run test:run`
- upload/list/download/search smoke checks
- `npm run build`

### Auth/onboarding/settings changes
- `npm run test:run`
- targeted Playwright auth/onboarding/settings pass
- manual signup/login/settings/logout smoke checks
- `npm run build`

## Known Real Blockers

- real Stripe payment -> credit grant -> deploy chain is not fully manual-proven yet
- real shared Telegram bot account-link completion is not finished yet
- real shared-bot message routing into the correct runtime is not finished yet
- real credit decrement/metering is not finished yet
- if `prisma migrate dev` fails during local work, check whether `.env` is pointing at an unreachable remote database
- that last one is environment drift, not automatically a code regression
