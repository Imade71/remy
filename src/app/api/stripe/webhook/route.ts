import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const userId = session.metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      if (!user) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!user) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "canceled",
          stripeSubscriptionId: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
