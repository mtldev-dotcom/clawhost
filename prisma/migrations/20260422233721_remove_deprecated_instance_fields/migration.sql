/*
  Warnings:

  - You are about to drop the column `aiApiKey` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the column `channelToken` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the column `telegramChannelId` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the `ProviderConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProviderConfig" DROP CONSTRAINT "ProviderConfig_instanceId_fkey";

-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "aiApiKey",
DROP COLUMN "channel",
DROP COLUMN "channelToken",
DROP COLUMN "telegramChannelId";

-- DropTable
DROP TABLE "ProviderConfig";
