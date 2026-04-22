# Architecture

This file is the architecture truth source for ClawHost.

## Product Direction

ClawHost is no longer just "host an agent fast".
It is being reshaped into a workspace-first AI product where:

- the **workspace** is the main user-facing shell
- the **hosted agent platform** remains the infrastructure layer underneath

Short version:
- pages, lightweight databases, file handling, and AI interaction become the product face
- auth, billing, provisioning, channels, providers, and skills remain platform internals

## Current Live System

### App Layer
- Next.js App Router app
- auth flows
- onboarding
- dashboard/workspace/settings/skills
- API routes for instance config, skills, provisioning, Stripe, and workspace files

### Data Layer
- PostgreSQL via Prisma
- core models:
  - `User`
  - `Workspace`
  - `Page`
  - `WorkspaceFolder`
  - `WorkspaceFile`
  - `Instance`
  - `ProviderConfig`
  - `Skill`
  - Auth.js tables

### Infrastructure Layer
- Stripe for billing
- Dokploy for hosted runtime provisioning
- OpenClaw runtime per user instance

## Current Route Model

### Auth and setup
- `/register`
- `/login`
- `/onboarding`

### Main app shell
- `/dashboard/workspace`
- `/dashboard/settings`
- `/dashboard/skills`
- `/chat`

Important truth:
- workspace is now the main merged-app shell
- `/chat` still exists as a direct conversation surface
- the final route simplification between workspace/chat/dashboard is not completely settled yet

## Current User Flow

```text
Register / Login
  ↓
Ensure workspace exists
  ↓
Ensure root page exists
  ↓
Bootstrap root folders (Inbox, Projects, Notes)
  ↓
Onboarding configures provider + model
  ↓
Provision hosted runtime
  ↓
Land in /dashboard/workspace
  ↓
Use pages, databases, file layer, settings, skills, and chat from the same account
```

## Workspace Model

### Pages
Each workspace currently supports:
- hierarchical page tree
- page types:
  - standard
  - database
  - board
  - dashboard
  - capture
- title + notes/content editing

### Database pages
Current database page behavior:
- starter schema inside `Page.content`
- field creation
- row creation
- simple rendered table view

This is intentionally lightweight for now. It is not yet a full Notion-style database system.

### Files
The new file-system layer currently includes:
- `WorkspaceFolder`
- `WorkspaceFile`
- automatic root folders
- authenticated file listing
- authenticated upload
- authenticated download
- simple file search UI

Current storage truth:
- app code uses a server-side storage helper
- default storage root is local to the app workspace unless overridden
- Dokploy compose truth currently mounts `openclaw_data:/app/data`
- docs must not claim `/data/workspace` as current runtime truth unless compose is changed to match

## Provisioning Truth

Provisioning is still a ClawHost platform responsibility.

Current reality:
- instance records exist in app DB
- provider/channel/model config lives in the app
- provisioning happens through Dokploy helpers in `src/lib/dokploy.ts`
- Stripe webhook and onboarding/settings paths still create some ambiguity around the exact canonical trigger for provisioning

That ambiguity is real and should be resolved in product logic, not hidden in docs.

## Security and Boundaries

- auth checks gate all workspace mutations and file access
- secrets stay server-side
- provisioning helpers stay centralized in `src/lib/dokploy.ts`
- storage access is moving behind `src/lib/workspace-storage.ts`
- route handlers should stay thin and reusable logic should live in `src/lib/*`

## Known Gaps

These are real architecture gaps, not doc bugs:
- Stripe → provisioning launch path is not fully proven end to end
- final workspace/chat/dashboard route simplification is unfinished
- workspace file delete flow is not complete yet
- folder navigation is still shallow compared to the intended product
- agent MCP hooks for workspace files are not wired yet
- latest workspace-files migration could not be applied locally when the configured remote DB was unreachable

## What Lives in Archive

Old agent-build scaffolding, historical audits, GCP-era deployment docs, and speculative PRD/design docs were moved to `docs/archive/2026-04-22-legacy/`.
They are reference material, not live truth.
