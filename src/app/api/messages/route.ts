import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ conversationId: null, messages: [] }, { status: 401 });

  const conversation = await prisma.conversation.findFirst({
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
      : await tx.conversation.create({ data: { userId } }); // lazy-create on first message

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
