-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCurrentPeriodEnd" DATETIME;
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "DailyUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "screenshotCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyUsage_userId_date_key" ON "DailyUsage"("userId", "date");
