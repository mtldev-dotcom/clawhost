# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `master`
**Last commit:** `77fa802 feat: M10-1 add owner admin dashboard at /admin`
**Plan version:** `plan-foyer.md` at repo root
**Task in flight:** none
**State:** M10-1 complete (admin dashboard). Owner can manage users, credits, skills, and system health at `/admin`.
**Updated:** 2026-04-27

---

## What happened this session

- M10-1: Owner admin dashboard shipped at `/admin`
  - Added `UserRole` enum + `role` field to Prisma schema (migration applied)
  - Threaded role through NextAuth JWT and session callbacks
  - Middleware guards `/admin/*` — non-admins redirected to `/dashboard`
  - 5 admin pages: overview stats, users table, user detail (credit/status/role mutations), skills CRUD, system instance health
  - `prisma/seed-admin.ts` — one-shot script to promote owner account

---

## To activate admin access

1. Register at `/register` with `nickybcotroni@gmail.com`
2. Run: `npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-admin.ts`
3. Sign in → visit `localhost:3000/admin`

---

## Verification at M10-1

```
tsc --noEmit: 0 errors in admin/auth/middleware files
migration: 20260427214128_add_user_role applied clean
```

---

## Next suggested task

M10-2 or M11 (Polish & Growth) — no immediate dev task unless user requests otherwise.

---

## Open questions for the human

- Domain registration (foyer.work preferred) still pending
- Favicon swap needs Foyer wordmark from human
- Stripe webhook registration at production domain
- Admin seed needs to be re-run after registering at `/register`

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-foyer.md`.
