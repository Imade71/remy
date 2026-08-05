"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground/70 mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/30 p-6 flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"form" | "success" | "invalid">("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INVALID_TOKEN") {
          setStatus("invalid");
        } else {
          setFormError(data.error ?? "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      setStatus("success");
    } catch {
      setFormError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card title="Reset your password" subtitle="This link is invalid">
        <p className="text-sm text-center text-muted-foreground/90">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          <Link href="/forgot-password" className="text-primary/70 hover:text-primary transition-colors">
            Request a new reset link
          </Link>
        </p>
      </Card>
    );
  }

  if (status === "invalid") {
    return (
      <Card title="Reset your password" subtitle="This link is invalid">
        <p className="text-sm text-center text-muted-foreground/90">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          <Link href="/forgot-password" className="text-primary/70 hover:text-primary transition-colors">
            Request a new reset link
          </Link>
        </p>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card title="Password reset" subtitle="You're all set">
        <p className="text-sm text-center text-muted-foreground/90">
          Your password has been reset successfully.
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          <Link href="/login" className="text-primary/70 hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card title="Reset your password" subtitle="Choose a new password below">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
          autoComplete="new-password"
          autoFocus
          className="w-full rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/50 transition-colors"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/50 transition-colors"
        />

        {formError && <p className="text-xs text-red-400/90 text-center">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-50",
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          )}
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground/70">
        <Link href="/login" className="text-primary/70 hover:text-primary transition-colors">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
