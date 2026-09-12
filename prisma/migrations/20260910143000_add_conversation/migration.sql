-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
-- Nullable for now: existing UserMessage rows have no Conversation yet.
-- Backfilled and made required in the two migrations that follow.
ALTER TABLE "UserMessage" ADD COLUMN "conversationId" TEXT;

-- CreateIndex
CREATE INDEX "UserMessage_conversationId_createdAt_idx" ON "UserMessage"("conversationId", "createdAt");

-- AddForeignKey
-- Safe to add now even though the column is still nullable/unpopulated:
-- NULL values trivially satisfy the FK, so this doesn't require a
-- backfill first and doesn't take a meaningful lock.
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
