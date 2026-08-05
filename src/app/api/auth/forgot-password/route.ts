import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a reset link.";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Only send a reset email if the account exists AND has a password
  // (Google-only accounts have no passwordHash to reset).
  if (user?.passwordHash) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any previously issued, still-outstanding reset tokens for
    // this user before creating the new one, so only the link from the
    // most recent request is ever valid — otherwise an earlier email's
    // link would stay usable in parallel with the new one.
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      }),
    ]);

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    sendPasswordResetEmail(user.email, resetUrl, user.name).catch((err) =>
      console.error("Failed to send password reset email:", err)
    );
  }

  // Always return the same response, whether or not the account exists
  // or is Google-only, so this endpoint can't be used to enumerate emails.
  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
