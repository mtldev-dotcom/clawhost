# Revenue Path Status

Last updated: 2026-04-22

Scope reviewed: Stripe checkout creation, Stripe webhook handling, post-payment instance state transitions, and provisioning trigger integration.

## Verified

### 1) Stripe checkout route exists and is wired to real Stripe SDK
File: `src/app/api/stripe/checkout/route.ts`

Verified in code:
- Requires authenticated user via `auth()`.
- Loads the user from Prisma.
- Creates a Stripe customer if `user.stripeCustomerId` is missing.
- Creates a real Stripe Checkout Session in `subscription` mode.
- Uses `env.STRIPE_PRICE_ID`.
- Sends success traffic to `/onboarding?session_id={CHECKOUT_SESSION_ID}` and cancel traffic to `/dashboard`.
- Stores `metadata.userId` on the checkout session.

What this proves:
- Checkout session creation is real application code, not mocked.
- The intended handoff from checkout to later webhook processing is present through `metadata.userId`.

### 2) Stripe webhook route exists and verifies signatures
File: `src/app/api/stripe/webhook/route.ts`

Verified in code:
- Reads raw request body with `req.text()`.
- Reads `stripe-signature` header.
- Calls `stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)`.
- Rejects invalid signatures with HTTP 400.

What this proves:
- Webhook verification logic is real and follows the required raw-body signature path.

### 3) Post-payment state transition to `provisioning` is implemented
File: `src/app/api/stripe/webhook/route.ts`

Verified in code for `checkout.session.completed`:
- Extracts `session.metadata.userId`.
- Upserts `Instance` by `userId`.
- Sets `status: 'provisioning'`.
- Stores `stripeSubId` from `session.subscription`.
- Stores `stripePriceId` from env on create.

Schema support verified in `prisma/schema.prisma`:
- `Instance.status` enum includes `pending`, `provisioning`, `active`, `failed`, `cancelled`.
- `stripeSubId` and `stripePriceId` fields exist.

What this proves:
- The DB state transition after successful checkout is real and persisted in Prisma.

### 4) Provisioning trigger integration is real
Files:
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/dokploy.ts`

Verified in code:
- Webhook calls `provisionInstance(user!, instance).catch(console.error)` asynchronously.
- `provisionInstance` contains real Dokploy API orchestration when Dokploy env vars are present:
  - create project
  - resolve environment
  - create compose service
  - upload compose YAML
  - create domain
  - deploy compose
  - fetch gateway token
  - update DB to `status: 'active'`
- Local fallback also exists when Dokploy is not configured, using Docker.
- On provisioning errors, instance status is updated to `failed`.

What this proves:
- The webhook really does fan out into a real provisioning service, not a placeholder.

### 5) Subscription deletion path is implemented
Files:
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/dokploy.ts`

Verified in code for `customer.subscription.deleted`:
- Finds instance by `stripeSubId`.
- Calls `deprovisionInstance(instance)`.
- `deprovisionInstance` removes the Dokploy project when configured, then updates Prisma instance status to `cancelled` and clears deployment identifiers.

What this proves:
- There is a real deprovision/cancellation path in code.

### 6) Narrow local automated verification passed
Command run:
- `npm run test:run`

Observed result:
- 4 test files passed
- 35 tests passed

Important note:
- These passing tests do **not** cover Stripe checkout, Stripe webhook handling, or provisioning end to end.
- Current passing coverage is around auth, instance API, skills API, and Dokploy response parsing.

## Partially verified

### 1) Revenue path wiring is present, but end-to-end proof is missing
Why partial:
- I verified the route code and service wiring.
- I did **not** verify a full live path from browser checkout -> Stripe event delivery -> provisioning completion.

Current confidence:
- High confidence on code-path presence.
- Low confidence on full runtime correctness under real Stripe delivery and real infrastructure credentials.

### 2) Provisioning implementation is real, but local proof depends on environment
Why partial:
- `src/lib/dokploy.ts` has a real local-Docker fallback and a real Dokploy path.
- I did not execute provisioning because that would require valid env, Docker/OpenClaw image availability, and a safe test user/instance context.

### 3) The product flow description is internally inconsistent
Files involved:
- `README.md`
- `docs/ARCHITECTURE.md`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/dashboard/settings/actions.ts`

Observed inconsistency:
- Docs still describe a target launch path of payment -> webhook -> provision.
- Current onboarding/settings code also supports a provider-first flow where provisioning is triggered later from dashboard/settings.
- That means there are effectively two competing provisioning entry points:
  - webhook-triggered provisioning after checkout
  - manual/settings-triggered provisioning after provider/channel configuration

Why partial:
- Both code paths are real.
- It is not yet proven which path is the intended launch truth, or whether both are required.

## Blocked

### 1) No direct automated tests for checkout or webhook routes
Blocked by:
- No Stripe-focused integration tests were found for:
  - `/api/stripe/checkout`
  - `/api/stripe/webhook`
  - webhook-triggered provisioning state changes

Impact:
- Route presence is verified, but behavior is not regression-locked.

### 2) No safe local end-to-end Stripe proof was available in this pass
Blocked by:
- Need valid local `.env.local` with Stripe test secrets and price ID.
- Need Stripe CLI or real Stripe dashboard webhook delivery.
- Need a safe test user flow and app server running.
- Need to avoid faking successful payment/provision claims without those pieces.

### 3) No safe local full provisioning proof was available in this pass
Blocked by at least one of:
- Dokploy credentials and reachable Dokploy instance, or
- local Docker/OpenClaw image/runtime readiness,
- plus a seeded/configured instance that can actually be provisioned.

### 4) Memory lookup was unavailable
Blocked by:
- `memory_search` failed due to embedding quota exhaustion.

Impact:
- I relied on repo code and visible session notes rather than semantic memory retrieval.

## What looks real vs mocked vs missing

### Real
- Stripe SDK usage in checkout route.
- Webhook signature verification.
- Prisma upsert/update state transitions.
- Async call from webhook into `provisionInstance()`.
- Real Dokploy API orchestration in `src/lib/dokploy.ts`.
- Real local Docker fallback in `src/lib/dokploy.ts`.
- Real deprovision path on subscription deletion.

### Mocked
- Stripe is mocked in test infrastructure under `tests/mocks/handlers/stripe.ts`, but I found no route/integration tests using that mock to prove the billing flow.

### Missing or not yet proven
- Checkout route integration tests.
- Webhook route integration tests.
- Idempotency proof for duplicate Stripe deliveries.
- Proof that webhook provisioning only runs when instance configuration is actually sufficient.
- Full local proof of signup -> payment -> webhook -> active instance.
- Full local proof of cancel -> deprovision against real infra.

## Risks / likely breakpoints

1. **Webhook may provision too early for current provider-first onboarding**
   - Webhook provisions immediately after payment.
   - `buildComposeYaml()` depends on `instance.channelToken`, `instance.aiApiKey`, `instance.aiProvider`, and optional model.
   - If those values are not configured yet, provisioning can still run with empty strings.

2. **Asynchronous webhook provisioning can hide failures from Stripe**
   - Webhook returns `{ received: true }` before provisioning completes.
   - This is normal for Stripe responsiveness, but it means provisioning failures are only visible in DB/logs.

3. **No explicit idempotency guard around repeated webhook delivery**
   - `upsert` helps for instance row creation.
   - But repeated `checkout.session.completed` events may still trigger multiple `provisionInstance()` calls.
   - I did not find a guard like "already active/already provisioning for this subscription event id".

## Exact next proof steps

### A. Smallest real checkout proof
1. Start app locally with valid Stripe test env.
2. Register/login a fresh local test user.
3. POST `/api/stripe/checkout` while authenticated.
4. Verify response contains a real Stripe checkout URL.
5. Verify Prisma user now has `stripeCustomerId` if it was previously empty.

### B. Smallest real webhook proof without full browser checkout
1. Run local app.
2. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. Capture the emitted local webhook secret and place it in `.env.local`.
4. Seed or create a test user and note its `userId`.
5. Trigger a Stripe test event that includes `metadata.userId` matching that user.
6. Confirm Prisma `Instance` row moves to `status='provisioning'` with `stripeSubId` set.
7. Confirm logs show `provisionInstance()` was entered.

### C. Smallest real provisioning proof
Choose one:

Option 1, local Docker path:
1. Unset Dokploy env vars.
2. Ensure Docker is running and `ghcr.io/openclaw/openclaw:latest` can be pulled.
3. Create a user + instance with valid `channel`, `channelToken`, `aiProvider`, `aiApiKey`.
4. Call `provisionInstance(user, instance)` from a safe script or through the app flow.
5. Verify Prisma updates to `status='active'`, `appUrl`, and gateway fields.

Option 2, Dokploy path:
1. Set valid `DOKPLOY_URL` and `DOKPLOY_API_KEY`.
2. Use a safe disposable test user.
3. Trigger provisioning once.
4. Confirm Dokploy project, compose service, domain, and Prisma updates exist.

### D. Minimal regression test work that should be added next
1. Add integration test for `/api/stripe/checkout`:
   - creates customer when missing
   - reuses customer when present
   - returns checkout URL
2. Add integration test for `/api/stripe/webhook`:
   - rejects bad signature
   - upserts instance on `checkout.session.completed`
   - calls provisioning trigger once
   - deprovisions on `customer.subscription.deleted`
3. Add idempotency test for repeated completed webhook delivery.

## Bottom line

The revenue path is **substantially real in code**: checkout, webhook verification, DB state transitions, provisioning trigger, and cancellation handling all exist.

What is **not proven yet** is the actual live end-to-end behavior under real Stripe event delivery and real provisioning runtime conditions.

Most important unresolved product question:
- whether ClawHost should provision **immediately after payment**,
- or only **after provider/channel onboarding is complete**.

Right now, the codebase appears to support both, and that is the main truth gap I would resolve next.
