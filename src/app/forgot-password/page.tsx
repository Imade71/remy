"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a reset link.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Network errors are ignored on purpose — we still show the generic
      // confirmation message so the endpoint can't be used to probe emails.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-primary/20 blur-2xl animate-glow-breathe" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-2xl font-bold text-primary shadow-xl shadow-primary/30">
                R
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {submitted
                  ? "Check your inbox"
                  : "Enter your email and we'll send you a reset link"}
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/30 p-6 flex flex-col gap-4">
            {submitted ? (
              <p className="text-sm text-center text-muted-foreground/90">{GENERIC_MESSAGE}</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/50 transition-colors"
                />

                {error && <p className="text-xs text-red-400/90 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-50",
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  )}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-muted-foreground/70">
              <Link href="/login" className="text-primary/70 hover:text-primary transition-colors">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
