import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const greeting = name ? `Hey ${name},` : "Hey there,";

  await resend.emails.send({
    from: "noreply@remy.coach",
    to,
    subject: "Welcome to Remy 👋",
    text: `${greeting}\n\nWelcome to Remy! Whenever you're stuck on a piece of software, just tell Remy what you're trying to do — you can even show it your screen — and it'll walk you through it step by step.\n\nGlad to have you here.\n\n— The Remy team`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name?: string | null) {
  const greeting = name ? `Hey ${name},` : "Hey there,";

  await resend.emails.send({
    from: "noreply@remy.coach",
    to,
    subject: "Reset your Remy password",
    text: `${greeting}\n\nWe got a request to reset your Remy password. Click the link below to choose a new one:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— The Remy team`,
  });
}
