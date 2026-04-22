# Roadmap

## Current State (v0.1)

- [x] User authentication (email/password)
- [x] Stripe subscription checkout
- [x] Stripe webhook handling
- [x] Instance provisioning via Dokploy
- [x] Dashboard with instance status
- [x] Channel configuration (Telegram/Discord/WhatsApp)
- [x] AI provider configuration (OpenAI/Anthropic/OpenRouter)
- [x] Onboarding wizard
- [x] Skills marketplace UI
- [x] Database schema and migrations

## Phase 1: Core Improvements

### Authentication
- [ ] OAuth providers (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication

### Dashboard
- [ ] Instance logs viewer
- [ ] Usage statistics
- [ ] Restart/redeploy button
- [ ] Instance health monitoring

### Billing
- [ ] Usage-based billing tier
- [ ] Invoice history
- [ ] Subscription management (upgrade/downgrade)
- [ ] Cancel subscription flow with deprovisioning

## Phase 2: Skills Marketplace

### Skill Integration
- [ ] Gmail - Full MCP integration
- [ ] Google Calendar - Event management
- [ ] Notion - Page/database access
- [ ] GitHub - Issues, PRs, repos
- [ ] Slack - Messaging
- [ ] Linear - Issue tracking

### Marketplace Features
- [ ] Skill configuration UI (API keys, settings)
- [ ] Skill categories and search
- [ ] Featured/popular skills
- [ ] Usage tracking per skill

## Workspace Productization

### Step 2.1, in progress
- [x] Workspace/page shell foundation
- [x] Typed pages + database starter schema
- [x] Database rows + simple table rendering
- [x] Workspace folder/file schema foundation
- [x] Authenticated workspace files list/upload API foundation
- [ ] Workspace file upload UI
- [ ] File delete
- [x] File download
- [x] File search foundation
- [ ] Agent MCP workspace read/write hooks

## Phase 3: Advanced Features

### Multi-tenancy
- [ ] Team accounts
- [ ] Shared instances
- [ ] Role-based access control
- [ ] Admin dashboard

### Developer Platform
- [ ] Custom skill development
- [ ] Skill submission/review process
- [ ] Revenue sharing for skill creators
- [ ] API documentation

### Enterprise
- [ ] Custom domains
- [ ] SSO integration
- [ ] Audit logs
- [ ] SLA guarantees
- [ ] Dedicated instances

## Phase 4: Scale & Polish

### Performance
- [ ] CDN for static assets
- [ ] Database optimization
- [ ] Caching layer (Redis)
- [ ] Background job queue

### Observability
- [ ] Error tracking (Sentry)
- [ ] Application metrics
- [ ] Alerting
- [ ] User analytics

### Developer Experience
- [ ] API for programmatic instance management
- [ ] CLI tool
- [ ] Terraform provider
- [ ] GitHub Actions integration

## Technical Debt

- [ ] Fix Next.js 15 build issue (upstream dependency)
- [ ] Add comprehensive test suite
- [ ] E2E tests with Playwright
- [ ] API documentation with OpenAPI
- [ ] Improve error handling and user feedback
- [ ] Add loading states and optimistic updates

## Nice to Have

- [ ] Dark mode
- [ ] Mobile app
- [ ] Browser extension
- [ ] Webhooks for instance events
- [ ] Instance templates/presets
- [ ] Instance cloning
- [ ] Scheduled scaling

## Contributing

Want to work on something? Check [CONTRIBUTING.md](./CONTRIBUTING.md) and pick an item from this roadmap. Create an issue to discuss before starting large features.
