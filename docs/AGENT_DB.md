# AGENT: Database + Prisma

## Your job
Create `prisma/schema.prisma` and run migrations.

## Schema to implement

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  stripeCustomerId String? @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  instance      Instance?
  accounts      Account[]
  sessions      Session[]
}

model Instance {
  id                String         @id @default(cuid())
  userId            String         @unique
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  status            InstanceStatus @default(pending)
  appUrl            String?        // e.g. user-abc.nickybruno.com
  dokployProjectId  String?
  dokployAppId      String?
  channel           String?        // telegram | discord | whatsapp
  channelToken      String?        // bot token or webhook secret
  aiProvider        String?        // openai | anthropic | openrouter
  aiApiKey          String?        // encrypted at rest
  enabledSkills     String[]       @default([])
  stripeSubId       String?        @unique
  stripePriceId     String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

enum InstanceStatus {
  pending
  provisioning
  active
  failed
  cancelled
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Skill {
  id          String  @id @default(cuid())
  name        String  @unique
  slug        String  @unique
  description String
  category    String  // messaging | productivity | dev | social
  mcpConfig   Json    // the MCP server config to inject
  iconUrl     String?
  active      Boolean @default(true)
}
```

## After creating schema
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Also create `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Seed file `prisma/seed.ts`
Create skills for Phase 2 marketplace:
- Gmail (category: productivity)
- Google Calendar (category: productivity)  
- Notion (category: productivity)
- Telegram (category: messaging)
- Discord (category: messaging)
- GitHub (category: dev)

Each skill needs a realistic `mcpConfig` JSON with placeholder env var references.
