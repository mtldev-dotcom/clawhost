# Roadmap

This roadmap is intentionally shorter and closer to the current app truth.

## Right Now

### Workspace productization
- [x] workspace bootstrap
- [x] typed pages
- [x] database starter schema
- [x] database row + simple table rendering
- [x] workspace folder/file schema foundation
- [x] workspace files list/upload API
- [x] workspace upload UI
- [x] workspace file download
- [x] workspace file search foundation
- [ ] workspace file delete
- [ ] deeper folder navigation
- [ ] agent MCP workspace read/write hooks

### Launch-critical proof
- [x] auth/onboarding/settings E2E truth realigned
- [x] logout test truth fixed
- [ ] live Stripe payment → provisioning proof
- [ ] settle the canonical provisioning trigger
- [ ] settle the final route truth between workspace/chat/dashboard
- [ ] finish shared Telegram bot account-link consumption flow
- [ ] verify subscription credit refill logic against real Stripe events

### Messaging and billing pivot
- [x] platform-managed OpenRouter env foundation
- [x] user credit balance schema foundation
- [x] shared Telegram deep-link token foundation
- [ ] consume Telegram `/start <token>` and persist linked Telegram identity
- [ ] route shared-bot messages into the correct user/runtime
- [ ] decide when credits decrement, and prove it with metering
- [ ] keep user-supplied provider keys as optional advanced mode later, not primary onboarding

## Near Term

### Workspace experience
- [ ] better board behavior
- [ ] better database editing/views
- [ ] folder-aware file browsing
- [ ] file previews where lightweight and safe

### Platform reliability
- [ ] surface provisioning errors cleanly
- [ ] improve deployment/redeploy visibility
- [ ] clarify runtime storage path truth in deploy config

### Skills and agent layer
- [ ] stronger skill configuration UX
- [ ] workspace-aware agent hooks
- [ ] clearer chat/workspace interplay inside the shell

## Later

- team/multi-user collaboration
- richer observability
- usage analytics and billing evolution
- partner/developer platform features
- enterprise controls

## Explicit Non-Truths

Do not use this file to pretend every old idea is still active.
If something is speculative, move it to archive or label it clearly.
