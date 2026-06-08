import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const intake = await prisma.intakeData.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(intake ?? null);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(null, { status: 401 });

  const { program, goal, familiarity } = await request.json();

  const intake = await prisma.intakeData.upsert({
    where: { userId: session.user.id },
    update: { program, goal, familiarity },
    create: { userId: session.user.id, program, goal, familiarity },
  });
  return NextResponse.json(intake);
}
