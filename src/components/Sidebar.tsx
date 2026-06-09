"use client";

import { useEffect, useState } from "react";
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

const GENERAL_LINKS = [
  { label: "Help" },
  { label: "Contact support" },
  { label: "Privacy policy" },
  { label: "Terms of service" },
];

export function Sidebar({ isOpen, onClose, session, isPro, intakeData, onNewConversation }: SidebarProps) {
  const router = useRouter();
  const [language, setLanguage] = useState("en");

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col bg-card border-r border-border/50 shadow-2xl shadow-black/30 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              R
            </div>
            <span className="font-semibold text-sm tracking-wide">REMY</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-border/40 transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">

          {/* ── Account ── */}
          <div className="rounded-2xl border border-border/40 bg-background/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="h-10 w-10 rounded-full border border-border/40 shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold border border-primary/20 shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary/10 rounded-full px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Pro
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/45 border border-border/40 rounded-full px-2.5 py-1">
                  Free
                </span>
              )}

              {!isPro && (
                <button
                  onClick={() => { router.push("/pricing"); onClose(); }}
                  className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-full px-3 py-1 transition-all duration-150 hover:bg-primary/5"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Upgrade
                </button>
              )}
            </div>
          </div>

          {/* ── Conversations ── */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground/35 uppercase tracking-[0.15em] px-1">
              Conversations
            </p>

            <button
              onClick={() => { onNewConversation(); onClose(); }}
              className="w-full flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/40 px-4 py-3 text-sm text-muted-foreground/60 hover:text-foreground hover:border-border/70 hover:bg-background/70 transition-all duration-150"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New conversation
            </button>

            {isPro ? (
              intakeData && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-[10px] text-primary/50 uppercase tracking-widest mb-1.5">Current</p>
                  <p className="text-sm font-medium truncate">{intakeData.goal}</p>
                  <p className="text-xs text-muted-foreground/45 truncate mt-0.5">{intakeData.program}</p>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-border/30 px-4 py-3 flex items-start gap-2.5">
                <svg className="mt-0.5 shrink-0 text-muted-foreground/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-xs text-muted-foreground/35 leading-relaxed">
                  Conversation history is a Pro feature
                </p>
              </div>
            )}
          </div>

          {/* ── Settings ── */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground/35 uppercase tracking-[0.15em] px-1">
              Settings
            </p>
            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground/65">Language</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs bg-transparent text-muted-foreground/65 hover:text-foreground focus:outline-none cursor-pointer transition-colors appearance-none pr-1"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} className="bg-card text-foreground">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── General ── */}
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground/35 uppercase tracking-[0.15em] px-1 mb-2">
              General
            </p>
            {GENERAL_LINKS.map((item) => (
              <button
                key={item.label}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-muted-foreground/55 hover:text-foreground hover:bg-border/25 transition-all duration-150"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border/30 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground/45 hover:text-foreground hover:bg-border/25 transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
