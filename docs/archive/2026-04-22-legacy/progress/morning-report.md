# Overnight ClawHost Run — Morning Handoff

## 1. Outcome
The launch-critical auth, onboarding, and settings slice is now aligned with the real provider-first product flow and passing in targeted E2E. Revenue and provisioning code paths were audited, partially hardened, and documented, but they are still not fully proven end to end.

## 2. What I verified
- `npm run lint` passes with 0 errors, 12 warnings.
- `npm run test:run` passes, 35/35 tests.
- `npx playwright test tests/e2e/auth/login.spec.ts tests/e2e/auth/signup.spec.ts tests/e2e/auth/logout.spec.ts tests/e2e/onboarding/wizard.spec.ts tests/e2e/dashboard/settings.spec.ts --project=chromium --workers=2` passes, 20/20 tests.
- Real UI flow is provider-first onboarding, then redirect to `/chat`.
- Channel config lives in dashboard settings, not onboarding.
- Logout currently lands on `/login`.
- Stripe checkout, webhook, and provisioning trigger paths are real in code, but not live-proven tonight.
- Provisioning state handling had real correctness issues in dashboard/webhook paths and cleanup; those were patched.

## 3. What I changed
### Tests
- Rewrote stale Playwright auth/onboarding/settings specs to match the current product.
- Stabilized Playwright by forcing a clean Next dev server on port `3001` with matching `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`.
- Updated logout expectations to current product truth.

### Product code
- Login now honors incoming `callbackUrl` instead of always forcing `/dashboard`.
- Logout button behavior was aligned with the verified runtime result used by the E2E suite.
- Provisioning-related runtime fixes from the provisioning subagent were preserved:
  - dashboard actions now use `containerHost ?? dokployAppId` where appropriate
  - async provisioning failures now mark instances `failed` in settings/webhook flows
  - deprovision cleanup now clears stale runtime fields

### Docs
- Updated `README.md` verified status and flow notes.
- Updated `docs/ARCHITECTURE.md` to stop overstating billing/provisioning and key-encryption certainty.
- Updated `docs/LOCAL_TESTING_GUIDE.md` to reflect provider-first onboarding and current settings flow.
- Wrote/updated progress docs:
  - `docs/progress/overnight-audit.md`
  - `docs/progress/e2e-status.md`
  - `docs/progress/revenue-path-status.md`
  - `docs/progress/provisioning-status.md`
  - `docs/progress/morning-report.md`

## 4. What is still failing
- No failing tests in the targeted auth/signup/logout/onboarding/settings slice.
- Full revenue-path proof is still missing.
- Full provisioning proof is still missing.
- Lint still has 12 warnings.

## 5. Risky / blocked areas
- Stripe checkout -> webhook -> active instance was not live-tested with real Stripe test delivery.
- Provisioning was not fully exercised against safe live Dokploy or local Docker runtime tonight.
- The codebase still appears to support two provisioning entry points:
  - payment-triggered webhook provisioning
  - onboarding/settings-triggered provisioning
  That product truth is still not fully settled.
- `src/lib/crypto.ts` exists, but provider-key encryption at rest is still not fully verified through current write paths.

## 6. Recommended next 5 actions
1. Decide the canonical launch truth for provisioning: after payment, or after onboarding/settings completion.
2. Add integration tests for `/api/stripe/checkout` and `/api/stripe/webhook`, including duplicate-delivery/idempotency coverage.
3. Run a safe real provisioning proof, either local Docker fallback or disposable Dokploy target.
4. Add a persisted `lastProvisionError` field on `Instance` and surface it in the dashboard/settings UI.
5. Decide whether `/chat` or `/dashboard` should be the single canonical post-onboarding chat surface, then collapse the drift.

## 7. Files changed
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/LOCAL_TESTING_GUIDE.md`
- `docs/progress/overnight-audit.md`
- `docs/progress/e2e-status.md`
- `docs/progress/revenue-path-status.md`
- `docs/progress/provisioning-status.md`
- `docs/progress/morning-report.md`
- `playwright.config.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/dashboard/actions.ts`
- `src/app/dashboard/settings/actions.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/PublicNav.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/InstanceCard.tsx`
- `src/i18n/messages/en.json`
- `src/i18n/messages/fr.json`
- `src/lib/dokploy.ts`
- `tests/e2e/auth/login.spec.ts`
- `tests/e2e/auth/logout.spec.ts`
- `tests/e2e/auth/signup.spec.ts`
- `tests/e2e/dashboard/settings.spec.ts`
- `tests/e2e/onboarding/wizard.spec.ts`

## 8. Commands run
- `npm run lint`
- `npm run test:run`
- `npx playwright test tests/e2e/auth/login.spec.ts --project=chromium`
- `npx playwright test tests/e2e/auth/logout.spec.ts --project=chromium`
- `npx playwright test tests/e2e/auth/login.spec.ts tests/e2e/auth/signup.spec.ts tests/e2e/auth/logout.spec.ts tests/e2e/onboarding/wizard.spec.ts tests/e2e/dashboard/settings.spec.ts --project=chromium --workers=2`
