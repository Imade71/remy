import { PricingPage } from "@/components/PricingPage";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

export default async function Pricing() {
  const session = await auth();
  let userIsPro = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });
    if (user) userIsPro = isPro(user);
  }

  return <PricingPage isAuthenticated={!!session} isPro={userIsPro} />;
}
