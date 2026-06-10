"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { IntakeData } from "./IntakeScreen";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;
  isPro: boolean;
  intakeData: IntakeData | null;
  onNewConversation: () => void;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
];

export function Sidebar({ isOpen, onClose, session, isPro, intakeData, onNewConversation }: SidebarProps) {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("remy-language");
    if (saved) setLanguage(saved);
  }, []);

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    localStorage.setItem("remy-language", lang);
  }

  const user = session?.user;
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "You";
  const initial = displayName[0].toUpperCase();
  const goalPreview = intakeData?.goal
    ? intakeData.goal.length > 38
      ? intakeData.goal.slice(0, 38).trimEnd() + "…"
      : intakeData.goal
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ background: "oklch(0.06 0.02 250 / 75%)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[265px] flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "oklch(0.085 0.032 248)",
          borderRight: "1px solid oklch(1 0 0 / 6%)",
          boxShadow: "4px 0 40px oklch(0 0 0 / 40%)",
        }}
      >
        {/* Atmospheric glow — top */}
        <div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 140% 50% at 50% -10%, oklch(0.62 0.17 235 / 0.1), transparent)",
          }}
        />

        {/* Close */}
        <div className="relative flex justify-end pt-5 pr-5">
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: "oklch(1 0 0 / 25%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "oklch(1 0 0 / 55%)")}
            onMouseLeave={e => (e.currentTarget.style.color = "oklch(1 0 0 / 25%)")}
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto px-7 pt-4 pb-6">

          {/* ── Identity ── */}
          <div className="mb-10">
            <div className="flex items-center gap-3.5 mb-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-11 w-11 rounded-full shrink-0"
                  style={{ border: "1px solid oklch(1 0 0 / 10%)" }}
                />
              ) : (
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full shrink-0 text-sm font-medium"
                  style={{
                    background: "oklch(0.62 0.17 235 / 0.18)",
                    border: "1px solid oklch(0.62 0.17 235 / 0.25)",
                    color: "oklch(0.62 0.17 235)",
                  }}
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "oklch(0.93 0.008 264)" }}>
                  {displayName}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "oklch(1 0 0 / 28%)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Plan */}
            <div className="flex items-center gap-3">
              {isPro ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1"
                  style={{
                    color: "oklch(0.62 0.17 235)",
                    background: "oklch(0.62 0.17 235 / 0.12)",
                    border: "1px solid oklch(0.62 0.17 235 / 0.2)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: "oklch(0.62 0.17 235)" }}
                  />
                  Pro
                </span>
              ) : (
                <>
                  <span
                    className="text-xs rounded-full px-2.5 py-1"
                    style={{ color: "oklch(1 0 0 / 28%)", border: "1px solid oklch(1 0 0 / 10%)" }}
                  >
                    Free
                  </span>
                  <button
                    onClick={() => { router.push("/pricing"); onClose(); }}
                    className="text-xs transition-colors duration-150"
                    style={{ color: "oklch(0.62 0.17 235 / 0.65)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.62 0.17 235)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.62 0.17 235 / 0.65)")}
                  >
                    Upgrade →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Workspace ── */}
          <div className="mb-10">
            <p
              className="text-[10px] tracking-[0.14em] uppercase mb-4"
              style={{ color: "oklch(1 0 0 / 18%)" }}
            >
              Workspace
            </p>

            {goalPreview && intakeData ? (
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "oklch(0.13 0.038 248)",
                  border: "1px solid oklch(1 0 0 / 7%)",
                  boxShadow: isPro ? "0 0 32px oklch(0.62 0.17 235 / 0.07)" : "none",
                }}
              >
                <p className="text-sm leading-snug mb-1.5" style={{ color: "oklch(0.93 0.008 264)" }}>
                  {goalPreview}
                </p>
                <p className="text-xs" style={{ color: "oklch(1 0 0 / 30%)" }}>
                  {intakeData.program}
                </p>
              </div>
            ) : (
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "oklch(0.11 0.03 248)",
                  border: "1px solid oklch(1 0 0 / 5%)",
                }}
              >
                <p className="text-sm" style={{ color: "oklch(1 0 0 / 22%)" }}>
                  No active workspace
                </p>
              </div>
            )}

            <button
              onClick={() => { onNewConversation(); onClose(); }}
              className="flex items-center gap-2 text-sm transition-colors duration-150"
              style={{ color: "oklch(1 0 0 / 28%)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "oklch(1 0 0 / 60%)")}
              onMouseLeave={e => (e.currentTarget.style.color = "oklch(1 0 0 / 28%)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New workspace
            </button>
          </div>

          {/* ── Language ── */}
          <div className="mb-10">
            <label
              className="flex items-center gap-2 cursor-pointer w-fit transition-colors duration-150 group"
              style={{ color: "oklch(1 0 0 / 28%)" }}
            >
              <span className="text-base leading-none select-none">🌐</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-sm bg-transparent border-none outline-none cursor-pointer appearance-none group-hover:opacity-80 transition-opacity"
                style={{ color: "inherit" }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} style={{ background: "oklch(0.13 0.038 248)", color: "oklch(0.93 0.008 264)" }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* ── General ── */}
          <div className="flex flex-col gap-0.5">
            {[
              { label: "Contact support", href: null },
              { label: "Privacy policy", href: "/privacy" },
              { label: "Terms of service", href: "/terms" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { if (item.href) { router.push(item.href); onClose(); } }}
                className="text-left text-sm py-2 transition-colors duration-150"
                style={{ color: "oklch(1 0 0 / 24%)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "oklch(1 0 0 / 55%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(1 0 0 / 24%)")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative px-7 py-5 shrink-0"
          style={{ borderTop: "1px solid oklch(1 0 0 / 6%)" }}
        >
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2.5 text-sm transition-colors duration-150"
            style={{ color: "oklch(1 0 0 / 22%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "oklch(1 0 0 / 50%)")}
            onMouseLeave={e => (e.currentTarget.style.color = "oklch(1 0 0 / 22%)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
