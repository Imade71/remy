import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TITLE_MAX_LENGTH = 60;

// Derived once, at creation time, from the conversation's first user
// message — never regenerated afterward.
function deriveTitle(content: string): string | null {
  const collapsed = content.replace(/\s+/g, " ").trim();
  if (!collapsed) return null;
  return collapsed.length > TITLE_MAX_LENGTH
    ? collapsed.slice(0, TITLE_MAX_LENGTH).trimEnd() + "…"
    : collapsed;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ conversationId: null, messages: [] }, { status: 401 });

  const requestedId = new URL(request.url).searchParams.get("conversationId");

  // A specific conversation (from clicking one in the history list), scoped
  // to this user, or — with no id given — whichever one was active last.
  const conversation = requestedId
    ? await prisma.conversation.findFirst({
        where: { id: requestedId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : await prisma.conversation.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    messages: conversation?.messages ?? [],
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const userId = session.user.id;
  const { messages, conversationId: requestedConversationId } = await request.json();

  // Only reuse the requested conversation if it actually belongs to this user.
  let conversationId: string | null = null;
  if (requestedConversationId) {
    const owned = await prisma.conversation.findFirst({
      where: { id: requestedConversationId, userId },
      select: { id: true },
    });
    if (owned) conversationId = owned.id;
  }

  const conversation = await prisma.$transaction(async (tx) => {
    const conv = conversationId
      ? await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })
      : await tx.conversation.create({
          // lazy-create on first message; title is set once, here, and
          // left alone on every later message in this conversation.
          data: {
            userId,
            title: deriveTitle(
              messages.find((m: { role: string; content: string }) => m.role === "user")?.content ?? ""
            ),
          },
        });

    await tx.userMessage.createMany({
      data: messages.map((m: { role: string; content: string; image?: { data: string; mediaType: string } }) => ({
        userId,
        conversationId: conv.id,
        role: m.role,
        content: m.content,
        imageData: m.image?.data ?? null,
        imageMediaType: m.image?.mediaType ?? null,
      })),
    });

    return conv;
  });

  return NextResponse.json({ ok: true, saved: true, conversationId: conversation.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const { conversationId } = await request.json().catch(() => ({ conversationId: null }));
  if (!conversationId) return NextResponse.json({ ok: true });

  // Scoped to id + userId so a conversation can only ever be deleted by its owner;
  // cascades to its messages via the FK's onDelete: Cascade.
  await prisma.conversation.deleteMany({
    where: { id: conversationId, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
