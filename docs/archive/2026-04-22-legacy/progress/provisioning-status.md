# Provisioning Status

Date: 2026-04-22
Repo: `/home/mtldev/active-dev-projects/clawhost`

## Scope
Reviewed and lightly corrected:
- `src/lib/dokploy.ts`
- `src/app/api/provision/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/instance/route.ts`
- `src/app/dashboard/actions.ts`
- `src/app/dashboard/settings/actions.ts`
- `src/components/dashboard/InstanceCard.tsx`
- high-visibility ClawHost vs NestAI product copy

## Current provisioning truth

### What the pipeline is today
1. Instance config is created or updated through `PATCH /api/instance`.
2. Manual deploy starts through `POST /api/provision` or server action `deployInstance()`.
3. Stripe checkout completion can also upsert an instance and trigger provisioning from the webhook.
4. `provisionInstance()` in `src/lib/dokploy.ts` is the real orchestration boundary.
5. Provisioning supports two runtime modes:
   - **Dokploy mode** when `DOKPLOY_URL` and `DOKPLOY_API_KEY` are set
   - **local Docker fallback** when Dokploy is not configured
6. A successful provision marks the instance `active` and stores:
   - `appUrl`
   - `dokployProjectId`
   - `dokployAppId`
   - `containerHost`
   - `gatewayToken`
   - `gatewayPort` (local flow)

### Important implementation details
- Production/Dokploy flow creates a project, resolves environment, creates a compose app, updates compose YAML, adds domain, deploys, then fetches the gateway token from the container.
- Local flow runs a local Docker container, configures OpenClaw, then stores localhost connection info.
- Chat runtime depends primarily on `containerHost`, `gatewayToken`, `gatewayPort`, and `status === active`.

## Verified issues found

### 1) Dashboard actions were using the wrong identifier
`src/app/dashboard/actions.ts` used `dokployAppId` directly for pairing approval and gateway token lookup.

That is wrong for the Dokploy path:
- `dokployAppId` = compose/app id
- `approvePairing()` and `getGatewayToken()` expect a **container name/host**
- the correct runtime field is `containerHost` (with `dokployAppId` only safe as a fallback in local flow)

### 2) Failed async provisioning was not consistently reflected in instance state
- `POST /api/provision` already flips failed async runs to `status: failed`
- `deployInstance()` did **not**
- Stripe webhook provisioning did **not**

This created a real risk of instances staying stuck in `provisioning` after background failure.

### 3) Deprovision left stale gateway/container fields behind
`deprovisionInstance()` cleared app and Dokploy ids, but left `containerHost` and `gatewayToken` populated.

That was low-risk to fix and helps prevent stale runtime state after cancellation.

## Low-risk fixes applied
- Fixed dashboard pairing approval to use `containerHost ?? dokployAppId`
- Fixed dashboard gateway token lookup to use `containerHost ?? dokployAppId`
- Updated `deployInstance()` async error handling to mark the instance `failed`
- Updated Stripe webhook async error handling to mark the instance `failed`
- Updated `deprovisionInstance()` to clear `containerHost` and `gatewayToken`
- Tightened user-facing provisioning/failed copy in `InstanceCard`

## What is still true after this pass
- Provisioning is still asynchronous and optimistic.
- There is still no persisted per-instance failure reason field for the UI.
- Status remains coarse: `pending | provisioning | active | failed | cancelled`.
- The old `docs/AGENT_PROVISIONER.md` is now partly historical and should not be treated as implementation truth over `src/lib/dokploy.ts`.

## Branding drift summary
High-confidence ClawHost vs NestAI drift was still present in user-visible surfaces. I corrected the obvious product-facing cases:
- `src/components/PublicNav.tsx`
- `src/app/layout.tsx`
- `src/i18n/messages/en.json`
- `src/i18n/messages/fr.json`
- `src/app/globals.css` comments

Remaining NestAI references appear to be in audit/history notes or legacy dev assets, not primary product copy.

## Recommended next follow-up
1. Add a nullable `lastProvisionError` field on `Instance` and surface it in dashboard/settings.
2. Replace duplicated pairing logic in `src/app/api/onboarding/approve-pairing/route.ts` with shared `src/lib/dokploy.ts` helpers.
3. Decide whether `docs/AGENT_PROVISIONER.md` should be updated or archived as historical scaffolding.
