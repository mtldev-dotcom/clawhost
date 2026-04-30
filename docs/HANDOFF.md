# Current Handoff

> This file is **overwritten** (not appended) at the end of every agent session.
> The next agent reads this first after `AGENTS.md`.

---

**Branch:** `master`
**Last commit:** `e23ea4a feat: delegate Telegram channel to OpenClaw runtime`
**Plan version:** `plan-foyer.md` at repo root
**Task in flight:** none
**State:** M10-2 complete. Telegram integration redesigned — OpenClaw runtime now owns Telegram end-to-end via long-polling. Settings page has profile edit, new Telegram pairing flow, and platform settings.
**Updated:** 2026-04-30

---

## What happened this session

- **Header fix:** Removed "pending" instance status badge from DashboardHeader. Replaced with `creditsBalance` display using Coins icon.
- **Nixpacks + CI fix:** Pinned Node 20 + npm 10 in `nixpacks.toml` to resolve Dokploy lock file mismatch. Updated CI to Node 24 + `npm install --legacy-peer-deps`.
- **Auto admin seed on deploy:** `package.json` start script now runs `prisma migrate deploy && tsx /app/prisma/seed-admin.ts && node .next/standalone/server.js`. `seed-admin.ts` made graceful (findUnique first, skip if not found/already admin).
- **Profile edit card:** Added Profile card to settings page — name, email, optional password change (bcrypt verify + hash). New `saveProfile` server action.
- **Telegram redesign (major):** Foyer no longer acts as Telegram's webhook target. OpenClaw runtime owns Telegram via long-polling (no HTTPS needed).
  - Deleted `src/app/api/telegram/webhook/route.ts`
  - New `saveTelegramBot`: verifies token via `getMe`, pushes token into user's OpenClaw container via `node /app/openclaw.mjs config set channels.telegram.botToken <token>` + reload
  - New `approveTelegramPairing`: calls `openclaw pairing approve telegram <code>` against user's container
  - Settings UI redesigned: Step 1 = paste token + Save; Step 2 = DM bot → get pairing code → Approve
  - `setChannelTelegramToken()` added to `src/lib/dokploy.ts`
  - Schema: removed `telegramChatId` from User, deleted orphan `TelegramLinkToken` model
  - Migration: `20260430212206_remove_telegram_chat_id_and_link_token` applied

---

## How Telegram works now

1. User creates a bot via @BotFather, gets a token
2. Pastes token in Settings → "Save bot token" → Foyer pushes it into the user's OpenClaw container
3. OpenClaw runtime connects outbound to Telegram (long-poll, no HTTPS needed)
4. User DMs their bot → bot replies with a pairing code
5. User pastes code in Settings → "Approve pairing" → Foyer calls `openclaw pairing approve telegram <code>`
6. All future Telegram messages flow Telegram ↔ OpenClaw directly — no Foyer involvement

---

## Open questions for the human

- The `openclaw reload` CLI subcommand may need verification at runtime. Fallback to `docker restart <container>` is already coded in `setChannelTelegramToken`.
- Domain registration (foyer.work preferred) still pending
- Stripe webhook registration at production domain

---

## Do not do

- Do not touch files under `docs/archive/**`.
- Do not batch tasks. One task at a time.
- Do not run `npm install <package>` without a `docs/DECISIONS.md` entry first.
- Do not invent tasks. Only execute tasks listed in `plan-foyer.md`.
