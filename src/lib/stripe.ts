import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const FREE_LIMITS = {
  messagesPerDay: 30,
  screenshotsPerDay: 3,
} as const;

export function isPro(user: { subscriptionStatus: string | null }) {
  return user.subscriptionStatus === "active";
}

export function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}
