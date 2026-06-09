import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const messages = await prisma.userMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  });

  // Free users get session-only memory — skip persisting
  if (!user || !isPro(user)) {
    return NextResponse.json({ ok: true, saved: false });
  }

  const { messages } = await request.json();
  await prisma.userMessage.createMany({
    data: messages.map((m: { role: string; content: string; image?: { data: string; mediaType: string } }) => ({
      userId: session.user.id,
      role: m.role,
      content: m.content,
      imageData: m.image?.data ?? null,
      imageMediaType: m.image?.mediaType ?? null,
    })),
  });
  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  await prisma.userMessage.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
