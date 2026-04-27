# Foyer — Launch Proof

> Checklist to verify before launch. Human sign-off required.

---

## Test Matrix

| # | Check | Criteria | Route | Status | Notes |
|---|-------|----------|-------|--------|-------|
| 1 | Registration | User can register with email/password | /register | | |
| 2 | Login | User can log in | /login | | |
| 3 | Onboarding | User completes onboarding, lands in workspace | /onboarding | | |
| 4 | Workspace bootstrap | Workspace has root page + folders (Inbox, Projects, Notes) | /dashboard/workspace | | |
| 5 | Page creation | User can create Standard, Database, Board, Dashboard, Capture pages | /dashboard/workspace | | |
| 6 | Database page | Fields + rows work, table view renders | /dashboard/workspace | | |
| 7 | File upload | User can upload files to workspace | /dashboard/workspace | | |
| 8 | File download | User can download uploaded files | /dashboard/workspace | | |
| 9 | Cmd+K palette | AI command palette opens, queries context, returns answer | /dashboard/workspace | | |
| 10 | Stripe checkout | User can start subscription checkout | /dashboard/settings | | |
| 11 | Credit decrement | AI command decrements credits | /dashboard/workspace | | |
| 12 | Settings | Model selection, deploy state visible | /dashboard/settings | | |
| 13 | Legal pages | ToS and Privacy render | /legal/terms, /legal/privacy | | |
| 14 | Status page | Health check renders app + DB status | /status | | |
| 15 | Brand correctness | No "ClawHost" appears anywhere in user-visible UI | / | | |
| 16 | Landing page | Hero copy is "Your second brain. Your plan. Your AI partner." | / | | |
| 17 | Cmd+K identity | AI introduces itself as "Foyer" if asked who it is | / | | |

---

## Sign-off

- [ ] All "ClawHost" references in user-visible surfaces have been replaced
- [ ] Favicon swap complete (Foyer wordmark)
- [ ] Domain configured and SSL active
- [ ] Stripe webhook registered
- [ ] Legal pages reviewed by human
- [ ] Production smoke test passed

---

## Notes

_Add any launch blockers or observations here._
