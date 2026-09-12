-- Data migration: give every user who already has messages a single
-- default Conversation, and attach their existing messages to it.
-- No message is deleted or reassigned between users.
--
-- Idempotent: both statements only touch rows that haven't been
-- migrated yet, so re-running this file (e.g. a manual retry) is a
-- no-op the second time.
--
-- Note on ids: this raw SQL runs outside Prisma Client, so it can't
-- call Prisma's cuid() generator. It uses Postgres's built-in
-- gen_random_uuid() instead, purely for these one-time backfilled
-- rows -- every Conversation created afterward through the app gets
-- a normal cuid() id as defined in schema.prisma.

-- One Conversation per user who has at least one existing message.
INSERT INTO "Conversation" ("id", "userId", "title", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, m."userId", NULL, MIN(m."createdAt"), MAX(m."createdAt")
FROM "UserMessage" m
WHERE NOT EXISTS (
    SELECT 1 FROM "Conversation" c WHERE c."userId" = m."userId"
)
GROUP BY m."userId";

-- Attach every existing message to its user's new default Conversation.
UPDATE "UserMessage" m
SET "conversationId" = c."id"
FROM "Conversation" c
WHERE c."userId" = m."userId"
  AND m."conversationId" IS NULL;
