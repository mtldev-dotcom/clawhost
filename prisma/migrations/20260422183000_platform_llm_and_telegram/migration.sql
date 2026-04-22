-- Create subscription status enum
CREATE TYPE "SubscriptionStatus" AS ENUM ('inactive', 'active', 'past_due', 'cancelled');

-- Alter user table
ALTER TABLE "User"
  ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'inactive',
  ADD COLUMN "creditsBalance" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lifetimeCreditsGranted" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "telegramUserId" TEXT,
  ADD COLUMN "telegramUsername" TEXT,
  ADD COLUMN "telegramLinkedAt" TIMESTAMP(3);

-- Alter instance table
ALTER TABLE "Instance"
  ADD COLUMN "telegramChannelId" TEXT;

-- Create telegram link token table
CREATE TABLE "TelegramLinkToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TelegramLinkToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");
CREATE UNIQUE INDEX "TelegramLinkToken_token_key" ON "TelegramLinkToken"("token");
CREATE INDEX "TelegramLinkToken_userId_expiresAt_idx" ON "TelegramLinkToken"("userId", "expiresAt");

ALTER TABLE "TelegramLinkToken"
  ADD CONSTRAINT "TelegramLinkToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
