/*
  Warnings:

  - You are about to drop the column `telegramChatId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TelegramLinkToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TelegramLinkToken" DROP CONSTRAINT "TelegramLinkToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramChatId";

-- DropTable
DROP TABLE "TelegramLinkToken";
