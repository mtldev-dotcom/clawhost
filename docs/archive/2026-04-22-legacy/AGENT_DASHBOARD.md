# AGENT: Dashboard UI

## Your job
Build the user-facing dashboard and onboarding wizard.

## Install shadcn/ui first
```bash
npx shadcn@latest init
npx shadcn@latest add card button input label badge select tabs
```

## Pages to build

### `src/app/dashboard/page.tsx`
Show:
- Instance status badge (pending / provisioning / active / failed)
- App URL with copy button (once active)
- Channel config section (select channel type, paste token)
- AI model config section (select provider, paste API key)
- "Save & Deploy" button → POST to `/api/provision`

### `src/app/onboarding/page.tsx`
3-step wizard after Stripe payment:
1. **Step 1** — Choose channel (Telegram / Discord / WhatsApp) + paste token
2. **Step 2** — Choose AI provider (OpenAI / Anthropic / OpenRouter) + paste API key
3. **Step 3** — Review + confirm → triggers provision → redirect to dashboard

### `src/app/dashboard/skills/page.tsx`
Phase 2 — Skills marketplace grid (see AGENT_SKILLS.md)

## Key components

### `src/components/dashboard/InstanceCard.tsx`
```typescript
// Props: instance: Instance
// Shows: status badge, URL, created date, "Open Agent" button
```

### `src/components/dashboard/ChannelSetup.tsx`
```typescript
// Props: instanceId, current channel/token
// Channel options with icons: Telegram 🤖, Discord 💬, WhatsApp 📱
// Saves to DB via server action
```

## Server Actions
Create `src/app/dashboard/actions.ts`:
- `updateChannelConfig(instanceId, channel, token)`
- `updateAiConfig(instanceId, provider, apiKey)`
- Both update DB then optionally redeploy

## Landing page `src/app/page.tsx`
Simple. If logged in → redirect to `/dashboard`. If not → show:
- Hero: "Your personal AI agent, hosted in 60 seconds"
- Pricing: $9/month
- CTA: "Start Free Trial" → triggers Stripe checkout or `/register`

## Layout `src/app/layout.tsx`
- Import Tailwind
- SessionProvider wrapper
- Simple nav: logo + "Dashboard" + "Sign out" if authenticated
