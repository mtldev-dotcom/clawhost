-- AlterTable
ALTER TABLE "Instance" ADD COLUMN     "agentLocale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';
