import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro, FREE_LIMITS, todayUTC } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionStatus: true,
      dailyUsages: {
        where: { date: todayUTC() },
        select: { messageCount: true, screenshotCount: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pro = isPro(user);
  const usage = user.dailyUsages[0] ?? { messageCount: 0, screenshotCount: 0 };

  return NextResponse.json({
    isPro: pro,
    messagesUsed: usage.messageCount,
    messagesLimit: pro ? null : FREE_LIMITS.messagesPerDay,
    screenshotsUsed: usage.screenshotCount,
    screenshotsLimit: pro ? null : FREE_LIMITS.screenshotsPerDay,
    date: todayUTC(),
  });
}
