// Milestone-1 entitlement check. There's no "Remy Handle" tier in
// Stripe/Prisma yet (see src/lib/stripe.ts for the current single
// isPro flag) — that's deliberately out of scope until the core loop
// is validated. Until then, access is either an explicit allowlist or,
// if that's unset, restricted to non-production so this doesn't go
// live for every user by accident.
export function isHandleEnabledForUser(email: string | null | undefined): boolean {
  const allowlist = process.env.HANDLE_ALLOWED_EMAILS;
  if (allowlist) {
    const allowed = allowlist.split(",").map((e) => e.trim().toLowerCase());
    return !!email && allowed.includes(email.toLowerCase());
  }
  return process.env.NODE_ENV !== "production";
}
