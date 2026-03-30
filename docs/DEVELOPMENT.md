# Development Guide

## Local Setup

### Prerequisites

- Node.js 18+ (recommend using nvm)
- Docker & Docker Compose
- Stripe CLI
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/mtldev-dotcom/clawhost.git
cd clawhost

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your values:

```bash
# Generate secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY
```

**Required for local dev:**
- `DATABASE_URL` - Use default from .env.example
- `NEXTAUTH_SECRET` - Generate with openssl
- `NEXTAUTH_URL` - http://localhost:3000
- `ENCRYPTION_KEY` - Required for API key encryption at rest (32 bytes base64)

**Optional for local dev:**
- Stripe keys - Only needed for payment testing
- Dokploy keys - Only needed for provisioning testing

**Rate Limiting Configuration:**
```bash
# Format: "count_minutes" (e.g., 100 requests per 15 minutes)
RATE_LIMIT_AUTH=10_15      # Auth endpoints: 10 req per 15 min
RATE_LIMIT_API=100_15      # General API: 100 req per 15 min
```

### Database Setup

```bash
# Start PostgreSQL container
npm run db:up

# Run migrations
npm run db:migrate

# Seed initial data (skills)
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### Running the App

```bash
# Development server with hot reload
npm run dev

# App available at http://localhost:3000
```

## Development Workflow

### Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes and test locally

3. Run linting
   ```bash
   npm run lint
   ```

4. Commit with conventional commits
   ```bash
   git commit -m "feat: add new feature"
   ```

### Database Changes

When modifying the schema:

```bash
# Edit prisma/schema.prisma

# Create migration
npx prisma migrate dev --name describe_change

# Regenerate client
npx prisma generate
```

### Adding UI Components

We use shadcn/ui. To add a component:

```bash
npx shadcn@latest add [component-name]
```

Components are added to `src/components/ui/`.

## Testing

### Manual Testing Checklist

- [ ] Registration flow
- [ ] Login/logout
- [ ] Dashboard loads with/without instance
- [ ] Onboarding wizard steps
- [ ] Channel configuration saves
- [ ] AI provider configuration saves
- [ ] Skills page loads and toggles work

### Stripe Testing

```bash
# Start Stripe webhook forwarding
npm run stripe:listen

# Copy the webhook secret to .env.local
# Use test card: 4242 4242 4242 4242
```

### API Testing

Use the REST client of your choice:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Get skills (no auth required)
curl http://localhost:3000/api/skills
```

## Debugging

### Common Issues

**"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**"Database connection failed"**
```bash
# Check if PostgreSQL is running
docker ps
npm run db:up
```

**"NEXTAUTH_SECRET missing"**
```bash
# Generate and add to .env.local
openssl rand -base64 32
```

### Logging

- Server logs appear in terminal running `npm run dev`
- Prisma query logs enabled in development
- Use `console.log` for debugging (remove before committing)

### Prisma Studio

Visual database browser:
```bash
npm run db:studio
# Opens at http://localhost:5555
```

## Code Organization

### Adding a New Feature

1. **Database** - Add models to `prisma/schema.prisma`
2. **API** - Create route in `src/app/api/`
3. **UI** - Create page in `src/app/` and components in `src/components/`
4. **Types** - Add types to `src/types/`

### File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run lint         # Run ESLint
npm run build        # Production build (may fail, see Known Issues)

# Database
npm run db:up        # Start PostgreSQL
npm run db:down      # Stop PostgreSQL
npm run db:migrate   # Run migrations
npm run db:seed      # Seed data
npm run db:studio    # Open Prisma Studio

# Stripe
npm run stripe:listen  # Forward webhooks locally
```

## IDE Setup

### VS Code Extensions

Recommended:
- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- ESLint

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```
