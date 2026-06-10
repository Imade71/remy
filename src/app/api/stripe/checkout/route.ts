import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const email = session.user.email;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "REMY Pro",
            description: "Unlimited messages & screenshots, full cross-session memory",
          },
          unit_amount: 1900,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/chat?upgraded=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    metadata: { userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
