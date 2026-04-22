-- CreateEnum
CREATE TYPE "WorkspaceActor" AS ENUM ('user', 'agent');

-- CreateTable
CREATE TABLE "WorkspaceFolder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceFile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "content" TEXT,
    "storageKey" TEXT NOT NULL,
    "createdBy" "WorkspaceActor" NOT NULL,
    "description" TEXT,
    "indexed" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceFolder_workspaceId_parentId_idx" ON "WorkspaceFolder"("workspaceId", "parentId");

-- CreateIndex
CREATE INDEX "WorkspaceFile_workspaceId_folderId_deletedAt_idx" ON "WorkspaceFile"("workspaceId", "folderId", "deletedAt");

-- CreateIndex
CREATE INDEX "WorkspaceFile_workspaceId_deletedAt_idx" ON "WorkspaceFile"("workspaceId", "deletedAt");

-- AddForeignKey
ALTER TABLE "WorkspaceFolder" ADD CONSTRAINT "WorkspaceFolder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFolder" ADD CONSTRAINT "WorkspaceFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkspaceFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFile" ADD CONSTRAINT "WorkspaceFile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceFile" ADD CONSTRAINT "WorkspaceFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "WorkspaceFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
