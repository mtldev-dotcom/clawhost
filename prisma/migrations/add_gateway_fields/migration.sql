-- Add gateway connection fields to Instance table
-- Run this migration to enable chat functionality

ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "gatewayToken" TEXT;
ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "containerHost" TEXT;
ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "gatewayPort" INTEGER NOT NULL DEFAULT 18789;