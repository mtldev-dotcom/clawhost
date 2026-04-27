-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "signupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailConfirm" BOOLEAN NOT NULL DEFAULT false,
    "defaultCredits" INTEGER NOT NULL DEFAULT 0,
    "defaultSubStatus" "SubscriptionStatus" NOT NULL DEFAULT 'inactive',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
