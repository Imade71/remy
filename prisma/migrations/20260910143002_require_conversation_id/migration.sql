-- AlterTable
-- Only safe to run once the backfill migration has confirmed every
-- UserMessage row has a non-null conversationId (verify with:
-- SELECT COUNT(*) FROM "UserMessage" WHERE "conversationId" IS NULL;
-- expect 0). Takes a brief ACCESS EXCLUSIVE lock while it scans the
-- table to validate the constraint.
ALTER TABLE "UserMessage" ALTER COLUMN "conversationId" SET NOT NULL;
