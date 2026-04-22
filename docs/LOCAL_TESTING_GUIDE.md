# Local Testing Guide

This file is the current verification truth source.

## Core Verification Commands

```bash
npm run test:run
npm run build
npx playwright test tests/e2e/auth/login.spec.ts tests/e2e/auth/signup.spec.ts tests/e2e/auth/logout.spec.ts tests/e2e/onboarding/wizard.spec.ts tests/e2e/dashboard/settings.spec.ts --project=chromium --workers=2
```

## Current High-Value Smoke Path

### 1. Auth + onboarding
- register a new user
- confirm redirect to `/onboarding`
- complete provider-first onboarding
- confirm landing in `/dashboard/workspace`

### 2. Workspace shell
- open `/dashboard/workspace`
- confirm workspace auto-bootstrap happened
- confirm root folders exist: Inbox, Projects, Notes
- create a standard page
- create a database page
- add a field
- add a row
- confirm the row appears in the table view

### 3. Workspace files
- upload a small text file from the workspace UI
- confirm the file appears in the root list
- use the download link and confirm the file is returned
- search by file name or description and confirm the file appears in results

### 4. Settings
- open `/dashboard/settings`
- confirm instance/provider/channel controls render

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

- onboarding is provider-first
- onboarding lands in `/dashboard/workspace`
- workspace is the primary merged-app shell
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
- `npm run build`

## Known Real Blockers

If `prisma migrate dev` fails during local work, check whether `.env` is pointing at an unreachable remote database.
That is environment drift, not automatically a code regression.
