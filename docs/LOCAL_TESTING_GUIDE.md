# Local Testing Guide - Post Security Hardening

Guide to run ClawHost locally for testing the security fixes.
This file is a truth source for local verification steps. Keep it aligned with the real app and current tests.

---

## Prerequisites

Also read `../AGENTS.md` and `./WORKFLOW.md` before changing or expanding the testing pipeline.

- Node.js 18+ installed
- Docker Desktop running
- Git (to pull latest changes)

---

## Step 1: Pull Latest Changes

```bash
git checkout dev-V1
# or your current working branch

git pull --ff-only
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

### Required Environment Variables

Edit `.env.local` and set these required values:

```bash
# 1. Generate NEXTAUTH_SECRET
# Run this command and copy the output:
openssl rand -base64 32

# 2. Generate ENCRYPTION_KEY (NEW - required for security)
# Run this command and copy the output:
openssl rand -base64 32

# 3. Set in .env.local:
NEXTAUTH_SECRET=paste-your-secret-here
ENCRYPTION_KEY=paste-your-encryption-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://clawhost:clawhost@localhost:5432/nestai-db

# Important:
# keep local testing on localhost + local Postgres
# do not point .env.local at the remote production app or DB during eval
```

### Optional (for full testing)

```bash
# For Stripe testing (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# For GCP/Dokploy testing (optional - local Docker works without)
GCP_PROJECT_ID=your-project
GCP_ZONE=us-central1-a
```

---

## Step 4: Start Database

```bash
# Start PostgreSQL in Docker
npm run db:up

# Wait 5 seconds for database to initialize
sleep 5

# Run migrations
npm run db:migrate

# Seed initial data (skills)
npm run db:seed
```

---

## Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

Current merged-app routes worth checking:
- `/dashboard/workspace` for the new workspace shell and page editing
- `/chat` for direct hosted-agent chat
- `/dashboard/settings` for provider/channel/deploy config

---

## Step 6: Test Security Features

### Test 1: Registration Password Validation

Try registering with a weak password:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123","name":"Test"}'
```

**Expected:** 400 error with password requirements message

Current confirmed behavior: passwords must include at least one uppercase letter, one lowercase letter, and one number.

Try with a strong password:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"SecurePass123","name":"Test"}'
```

**Expected:** 201 success, user created

---

### Test 2: Rate Limiting

Register multiple times quickly:

```bash
# Run this 11+ times in a row
for i in {1..12}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@test.com\",\"password\":\"SecurePass123\",\"name\":\"Test\"}"
  echo ""
done
```

**Expected:** After 10th request, returns 429 (Too Many Requests)

---

### Test 3: Shell Injection Protection

Try to inject a command through channel token:

```bash
# First, register and login to get a session
# Then try to update instance with malicious token
curl -X PATCH http://localhost:3000/api/instance \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"channelToken":"test; rm -rf /","channel":"telegram"}'
```

**Expected:** Command rejected due to invalid characters

---

### Test 4: Encryption Module

Test the encryption in Node REPL:

```bash
node -e "
const { encrypt, decrypt } = require('./src/lib/crypto.ts');
const testKey = 'sk-test-key-12345';
const encrypted = encrypt(testKey);
const decrypted = decrypt(encrypted);
console.log('Original:', testKey);
console.log('Encrypted:', encrypted.slice(0, 20) + '...');
console.log('Decrypted:', decrypted);
console.log('Match:', testKey === decrypted);
"
```

---

### Test 5: Workspace Bootstrap Smoke Test

After signing in with any valid account:

1. Open `http://localhost:3000/dashboard/workspace`
2. Expected: the app creates or reuses one default workspace automatically
3. Expected: a root `Home` page exists behind the scenes
4. Create a standard page from the workspace sidebar form
5. Create a database page from the same form
6. Open the database page and add a field
7. Add a row and confirm it renders in the table
8. Rename it and save notes/description in the editor
9. Create a subpage under it
10. Archive the child page and confirm it disappears from the active tree
11. Confirm the workspace shows bootstrapped root folders for the file-system layer (Inbox, Projects, Notes)

### Test 6: Complete End-to-End User Flow (Sign Up → Chat via Telegram)

This test covers the entire user journey from registration to chatting with your OpenClaw agent on Telegram.

---

#### **Flow A: Registration & Login**

**A1. Register a New Account (Browser)**

1. Open http://localhost:3000/register
2. Fill in the form:
   - **Name**: `Test User`
   - **Email**: `alice@example.com`
   - **Password**: `SecurePass123`
3. Click **"Create Account"**
4. **Expected:** Auto-signed-in and redirected to `/onboarding`

**A2. Verify Registration via API (Alternative)**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123","name":"Alice"}'
```

**Expected:** `201 Created` with `{ "id": "clxx..." }`

**A3. Test Password Validation (Negative Tests)**

| Test Case | Password | Expected Result |
|-----------|----------|-----------------|
| Too short | `Pass1` | 400 - "at least 8 characters" |
| No uppercase | `securepass123` | 400 - "uppercase letter" |
| No lowercase | `SECUREPASS123` | 400 - "lowercase letter" |
| No digit | `SecurePassword` | 400 - "one number" |
| Empty | `""` | 400 - "Password is required" |

**A4. Test Login**

1. If not auto-logged-in, go to http://localhost:3000/login
2. Enter email: `alice@example.com`, password: `SecurePass123`
3. **Expected:** Redirected to `/onboarding`

**A5. Test Failed Login (Negative)**

1. Use wrong password: `WrongPassword123`
2. **Expected:** Error message "Invalid credentials" (generic — doesn't reveal if email exists)

---

#### **Flow B: Onboarding Wizard (5 Steps)**

**Prerequisite:** You must be logged in. Visit http://localhost:3000/onboarding

**B1. Step 1 — Configure AI Provider**

1. Open http://localhost:3000/onboarding after signup/login
2. Select a provider:
   - **OpenAI** — Enter your OpenAI API key (`sk-...`)
   - **Anthropic** — Enter your Anthropic API key (`sk-ant-...`)
   - **OpenRouter** — Enter your OpenRouter API key
3. Click **"Test & Continue"**
4. **Expected:** Provider key test succeeds and the flow advances to model selection

**B2. Step 2 — Select Model**

1. Choose a model from the list (for example `GPT-4o`)
2. **Expected:** The deploy button becomes enabled only after a model is selected

**B3. Step 3 — Deploy Agent**

1. Click **"Deploy Agent"**
2. **Expected:** Success screen appears
3. **Expected:** Auto-redirects to `/chat` after the success state

**B4. Current onboarding truth**

- Onboarding is now **provider-first**
- Telegram/channel setup is **not** part of onboarding anymore
- Pairing and channel updates happen later in **Dashboard Settings**

---

#### **Flow C: Dashboard & Settings**

**C1. Check Instance Status**

1. Go to http://localhost:3000/dashboard/settings
2. **Expected:**
   - **Instance Status** card is visible
   - current status is shown (`pending`, `provisioning`, `active`, `failed`, etc.)
   - provider and channel tabs are available

**C2. Instance Not Ready (Negative Test)**

1. Via Prisma Studio, set instance status to `pending`:
   ```bash
   npm run db:studio
   ```
2. Refresh dashboard
3. **Expected:** Shows "Your agent is being configured. Please wait..."

**C3. Settings Page — Add Another AI Provider**

1. Go to http://localhost:3000/dashboard/settings
2. Click **"OpenAI"** (or another provider) card
3. Enter API key
4. Click **"Save Provider"**
5. **Expected:** Provider appears in the list with key mask (e.g., `sk-proj-...abcd`)

**C4. Test Provider API Key**

1. On the saved provider card, click **"Test Key"**
2. **Expected:** Badge shows ✓ Valid

**C5. Set Active Model**

1. On the provider card, click a model button (e.g., `gpt-4-turbo`)
2. **Expected:** Model becomes active (badge shown), success toast appears

**C6. Switch Active Provider**

1. Click a model on a different provider
2. **Expected:** Previous provider's `active` badge removed, new one gets it

**C7. Delete a Provider**

1. Click the trash icon on a provider card
2. **Expected:** Provider removed, toast message appears

**C8. Update Channel Configuration**

1. Go to **"Channel"** tab
2. Select **"Telegram"**
3. Enter a new bot token
4. Click **"Save"**
5. **Expected:** Success toast "Channel configuration saved"

**C9. Approve Pairing Code from Settings**

1. Send a message to your Telegram bot
2. Copy the pairing code from the bot's reply
3. Paste into **"Telegram Pairing Code"** field on settings page
4. Click **"Approve"**
5. **Expected:** Success toast "Pairing approved! You can now chat with the bot."

**C10. Deploy / Redeploy**

1. Ensure you have at least one provider and channel configured
2. Click **"Deploy"** (or **"Redeploy"** for active instances)
3. **Expected:** Toast "Deployment started", Docker container starts/restarts
4. Verify:
   ```bash
   docker ps | grep openclaw
   ```

---

#### **Flow D: Chat with Agent via Telegram**

**D1. Direct Telegram Chat**

1. Open Telegram
2. Find your bot (e.g., `@my_test_bot`)
3. Send a message: `Hello! What can you do?`
4. **Expected:** The agent responds within a few seconds with an AI-generated reply

**D2. Multi-Turn Conversation**

1. Continue the conversation:
   - `Summarize the following text: [paste text]`
   - `Translate this to French: Hello world`
   - `What is the capital of Canada?`
2. **Expected:** Each message gets an appropriate AI response

**D3. Agent Persona / Instructions**

1. If your OpenClaw agent has custom instructions, test them:
   - E.g., if it's set to be a coding assistant: `Write a Python function to reverse a string`
2. **Expected:** Response follows the agent's configured persona/instructions

**D4. Unpaired Bot (Negative Test)**

1. Create a new Telegram bot via BotFather
2. Configure it in settings but **don't send a pairing code**
3. Message the new bot
4. **Expected:** Bot does not respond, or replies with a pairing prompt

---

#### **Flow E: Alternative Quick Test (Without Telegram)**

If you don't have a Telegram bot ready, you can skip to provisioning directly:

**E1. Register via API**

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"BobPassword123","name":"Bob"}'
```

**E2. Login & Get Session**

Open the browser, log in as `bob@example.com`.

**E3. Create Instance via Prisma Studio**

```bash
npm run db:studio
```

1. Go to **Instance** table → **Add record**
2. Fill in:
   - `userId`: Find Bob's user ID in the User table and paste it
   - `status`: `pending`
   - `channel`: `telegram`
   - `channelToken`: Your Telegram bot token
   - `aiProvider`: `openai`
   - `aiApiKey`: Your OpenAI API key (will be encrypted on save)
   - `activeModel`: `openai/gpt-4o`
   - `agentLocale`: `en`
3. Save the record

**E4. Provision**

```bash
curl -X POST http://localhost:3000/api/provision \
  -H "Cookie: your-session-cookie-here"
```

Or use the UI: go to `/dashboard/settings` and click **Deploy**

**E5. Verify Container is Running**

```bash
docker ps
# Should see: openclaw-bob-example-com
```

**E6. Test Telegram Chat**

Message your bot on Telegram — it should respond.

---

#### **Flow F: Edge Cases & Error Recovery**

**F1. Duplicate Registration**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123","name":"Alice"}'
```

**Expected:** Returns `400` with generic `{ "error": "Registration failed" }` — does NOT reveal email already exists

**F2. Provision Without Instance**

```bash
curl -X POST http://localhost:3000/api/provision \
  -H "Cookie: valid-session-cookie"
```

**Expected:** `404` — "No instance found"

**F3. Double Provision (Race Condition)**

Send two provision requests simultaneously:

```bash
curl -X POST http://localhost:3000/api/provision &
curl -X POST http://localhost:3000/api/provision &
```

**Expected:** Second request returns `429` — "Already provisioning"

**F4. Invalid Telegram Token**

In onboarding step 1, enter an invalid token (e.g., `fake-token`)

**Expected:** Error "Invalid Telegram bot token" — stays on Step 1

**F5. Invalid AI API Key**

In onboarding step 2, enter a fake API key (e.g., `sk-fake-key`)

**Expected:** Error "Invalid API key" — stays on Step 2, ✗ icon appears

**F6. Invalid Pairing Code**

In Step 4, enter a random string that doesn't match a pending pairing

**Expected:** Error "Pairing code expired" or "Invalid pairing code"

---

## Step 7: Verify Security Logs

Check that sensitive data is not logged:

```bash
# In another terminal, tail logs
tail -f /dev/null  # Or use app output

# When you register/login, you should NOT see:
# - Plaintext passwords
# - Full API keys
# - Session tokens
```

---

## Troubleshooting

### "ENCRYPTION_KEY is required"

```bash
# Generate and add to .env.local
openssl rand -base64 32
```

### "Database connection failed"

```bash
# Check if PostgreSQL is running
npm run db:up
docker ps | grep postgres

# Check logs
docker logs clawhost-postgres-1
```

### "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Rate limit hit during testing

```bash
# Temporary: restart dev server to reset in-memory rate limits
# Or wait 15 minutes
```

---

## Cleanup

After testing, clean up:

```bash
# Stop dev server (Ctrl+C)

# Stop database
npm run db:down

# Remove containers
npm run db:down
```

---

## Quick Commands Reference

```bash
# Start everything
npm run db:up && sleep 5 && npm run db:migrate && npm run dev

# Reset everything
npm run db:down && npm run db:up && npm run db:migrate && npm run db:seed

# View database
npm run db:studio  # Opens http://localhost:5555

# Test build (like production)
npm run build
```

---

## Security Checklist for Local Testing

- [ ] Registration rejects weak passwords (less than 8 chars, no uppercase, etc.)
- [ ] Registration rate limits after 10 attempts
- [ ] Encryption module works (encrypt/decrypt roundtrip)
- [ ] Prisma query logging disabled (no queries in logs)
- [ ] Shell injection blocked (validateContainerName, validateCommandArg)
- [ ] Docker commands use spawn() not exec()
- [ ] Environment variables validated at startup

---

**For Production Deploy:** See `docs/SECURITY_FIXES.md` for checklist
