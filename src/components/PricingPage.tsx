"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PricingPageProps {
  isAuthenticated: boolean;
  isPro: boolean;
}

export function PricingPage({ isAuthenticated, isPro }: PricingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="text-lg font-extrabold tracking-tight">
            remy<span className="text-primary">.</span>
          </span>
        </button>
        {isAuthenticated && (
          <button onClick={() => router.push("/chat")} className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Back to chat
          </button>
        )}
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center px-6 pt-20 pb-16 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex h-16 w-16 mx-auto items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-2xl font-bold text-primary shadow-xl shadow-primary/30">
            R
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Simple, honest pricing</h1>
        <p className="text-muted-foreground text-base max-w-md">
          Start free. Upgrade when you need more.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch px-6 pb-24 max-w-3xl mx-auto">
        {/* Free */}
        <div className="flex-1 rounded-2xl border border-border/50 bg-card/60 p-8 flex flex-col">
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Free</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground mb-1">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Get started, no card needed</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {[
              "30 messages per day",
              "3 screenshot uploads per day",
              "All software tools supported",
              "Session-only memory (resets on reload)",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <svg className="mt-0.5 shrink-0 text-muted-foreground/60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-border/40 bg-background/50 py-3 text-center text-sm text-muted-foreground font-medium">
            {isAuthenticated ? "Your current plan" : "Current plan"}
          </div>
        </div>

        {/* Pro */}
        <div className={cn(
          "flex-1 rounded-2xl border p-8 flex flex-col relative overflow-hidden",
          isPro
            ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/10"
            : "border-primary/40 bg-card/60 shadow-xl shadow-primary/10"
        )}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-medium text-primary uppercase tracking-widest">REMY Pro</p>
              {isPro && (
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-muted-foreground mb-1">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Everything you need to build without limits</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {[
              "Unlimited messages",
              "Unlimited screenshot uploads",
              "All software tools supported",
              "Full cross-session memory",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <svg className="mt-0.5 shrink-0 text-primary" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <button
              onClick={handleManage}
              disabled={loading}
              className="w-full rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm text-primary font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Manage subscription"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {loading ? "Loading..." : isAuthenticated ? "Upgrade to Pro" : "Sign up and upgrade"}
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground/40 pb-12">
        Payments processed securely by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
