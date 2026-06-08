-- CreateTable
CREATE TABLE "CachedAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CachedAnswer_program_idx" ON "CachedAnswer"("program");
