# E2E Status

Last updated: 2026-04-22

## Verified current flow

1. `/register` creates the user, auto-signs in, then routes to `/onboarding`.
2. `/login` signs in with credentials, respects `callbackUrl` when present, otherwise routes to `/dashboard`.
3. `/dashboard` redirects users without an instance to `/onboarding`.
4. `/onboarding` is provider-first:
   - choose provider
   - test API key
   - choose model
   - deploy
   - success redirects to `/chat`
5. Channel setup is handled in `/dashboard/settings`, not in onboarding.
6. `/chat`, `/dashboard/settings`, and `/dashboard/skills` all share the same dashboard header/nav.
7. Logout currently returns users to `/login`.

## What changed in this pass

- Rewrote stale Playwright auth/onboarding/settings specs to match the actual provider-first product.
- Fixed login-page success routing so `callbackUrl` is honored.
- Fixed Playwright dev-server isolation by forcing a clean Next server on port `3001` with matching auth app URLs.
- Tightened logout expectations to current product truth.
- Updated settings assertions to match the actual instance-status UI.

## Commands run

- `npx playwright test tests/e2e/auth/login.spec.ts --project=chromium`
- `npx playwright test tests/e2e/auth/logout.spec.ts --project=chromium`
- `npx playwright test tests/e2e/auth/login.spec.ts tests/e2e/auth/signup.spec.ts tests/e2e/auth/logout.spec.ts tests/e2e/onboarding/wizard.spec.ts tests/e2e/dashboard/settings.spec.ts --project=chromium --workers=2`

## Latest verified result

- `tests/e2e/auth/login.spec.ts` → pass
- `tests/e2e/auth/signup.spec.ts` → pass
- `tests/e2e/auth/logout.spec.ts` → pass
- `tests/e2e/onboarding/wizard.spec.ts` → pass
- `tests/e2e/dashboard/settings.spec.ts` → pass
- Combined targeted slice: **20/20 passing**

## Remaining gaps

1. This is a targeted launch-critical slice, not the full Playwright suite.
2. Revenue-path coverage is still missing for live Stripe checkout and webhook delivery.
3. Provisioning is still only partially proven end to end.
4. `/chat` and `/dashboard` still overlap conceptually, even though the current tests now reflect the actual behavior.

## Recommended next test work

1. Add Stripe checkout and webhook integration tests.
2. Add provisioning-path tests around `failed` vs `active` state transitions.
3. Decide whether `/chat` or `/dashboard` should be the single canonical chat landing surface.
4. Add stable test ids to onboarding and settings controls to reduce text-selector brittleness.
