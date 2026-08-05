import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const INVALID_TOKEN_ERROR =
  "This reset link is invalid or has expired. Please request a new one.";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: INVALID_TOKEN_ERROR, code: "INVALID_TOKEN" },
      { status: 400 }
    );
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  // Atomically claim the token: this is a single UPDATE ... WHERE statement,
  // so if two requests race on the same token, only one can match the
  // `usedAt: null` condition and flip it — the loser gets count 0 and is
  // rejected. Checking-then-deleting as two separate steps (the previous
  // approach) left a window where both requests could pass the validity
  // check before either write committed, letting a token be used twice.
  const now = new Date();
  const claim = await prisma.passwordResetToken.updateMany({
    where: { token, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });

  if (claim.count === 0) {
    return NextResponse.json(
      { error: INVALID_TOKEN_ERROR, code: "INVALID_TOKEN" },
      { status: 400 }
    );
  }

  const resetToken = await prisma.passwordResetToken.findUniqueOrThrow({
    where: { token },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  // Update the password and clean up every outstanding reset token for this
  // user (not just the one used) so old emailed links stop working too.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
