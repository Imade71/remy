"use client";

import { Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChatInterface } from "@/components/ChatInterface";
import { IntakeScreen, type IntakeData } from "@/components/IntakeScreen";
import { Sidebar } from "@/components/Sidebar";
import type { MessageImage } from "@/components/ChatInterface";

interface StoredMessage {
  id: string;
  role: string;
  content: string;
  imageData: string | null;
  imageMediaType: string | null;
}

interface UsageState {
  isPro: boolean;
  messagesUsed: number;
  messagesLimit: number;
  screenshotsUsed: number;
  screenshotsLimit: number;
}

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="flex gap-[5px] items-center">
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "120ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "240ms" }} />
      </span>
    </div>
  );
}

function ChatContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [initialMessages, setInitialMessages] = useState<Array<{ role: "user" | "assistant"; content: string; image?: MessageImage }> | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setDataLoading(true);

    Promise.all([
      fetch("/api/intake").then((r) => r.json()),
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ]).then(([intake, messages, usageData]) => {
      if (intake) setIntakeData(intake);
      if (Array.isArray(messages)) {
        setInitialMessages(
          messages.map((m: StoredMessage) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            ...(m.imageData && m.imageMediaType
              ? {
                  image: {
                    data: m.imageData,
                    mediaType: m.imageMediaType as MessageImage["mediaType"],
                    previewUrl: `data:${m.imageMediaType};base64,${m.imageData}`,
                  },
                }
              : {}),
          }))
        );
      } else {
        setInitialMessages([]);
      }
      if (usageData && !usageData.error) {
        setUsage({
          isPro: usageData.isPro,
          messagesUsed: usageData.messagesUsed,
          messagesLimit: usageData.messagesLimit ?? 30,
          screenshotsUsed: usageData.screenshotsUsed,
          screenshotsLimit: usageData.screenshotsLimit ?? 3,
        });
      }
      setDataLoading(false);
    });
  }, [session?.user?.id]);

  async function handleIntakeComplete(data: IntakeData) {
    await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setIntakeData(data);
    setInitialMessages([]);
  }

  async function handleNewConversation() {
    await fetch("/api/messages", { method: "DELETE" });
    setIntakeData(null);
    setInitialMessages([]);
  }

  const upgraded = searchParams.get("upgraded") === "true";
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(upgraded);

  useEffect(() => {
    if (!showUpgradeBanner) return;
    router.replace("/chat");
    const t = setTimeout(() => setShowUpgradeBanner(false), 8000);
    return () => clearTimeout(t);
  }, [showUpgradeBanner]);

  if (status === "loading" || (session && dataLoading)) {
    return (
      <main className="flex flex-col h-full">
        <Header session={session} isPro={false} />
        <div className="flex-1 overflow-hidden">
          <Spinner />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col h-full">
        <Spinner />
      </main>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "there";

  return (
    <main className="flex flex-col h-full">
      <Header
        session={session}
        isPro={usage?.isPro ?? false}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex-1 overflow-hidden">
        <div
          key={intakeData ? "chat" : "intake"}
          className="h-full animate-in fade-in-0 duration-500"
        >
          {intakeData && initialMessages !== null ? (
            <ChatInterface
              intakeData={intakeData}
              initialMessages={initialMessages}
              initialUsage={usage ?? undefined}
            />
          ) : (
            <IntakeScreen onComplete={handleIntakeComplete} />
          )}
        </div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
        isPro={usage?.isPro ?? false}
        intakeData={intakeData}
        onNewConversation={handleNewConversation}
      />

      {showUpgradeBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-300">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setShowUpgradeBanner(false)} />
          <div className="relative z-10 w-full max-w-sm mx-6 rounded-3xl border border-primary/30 bg-card shadow-2xl shadow-primary/15 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-7">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-150" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/15 shadow-xl shadow-primary/30">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                </div>
              </div>

              <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-[0.2em] mb-3">
                REMY Pro · Active
              </p>
              <h2 className="text-[1.6rem] font-semibold tracking-tight leading-snug mb-3">
                You&apos;re in, {firstName}.
              </h2>
              <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-[260px]">
                No limits, full memory — let&apos;s build something great.
              </p>

              <button
                onClick={() => setShowUpgradeBanner(false)}
                className="mt-8 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/35 transition-all duration-200"
              >
                Let&apos;s go
              </button>
              <button
                onClick={() => setShowUpgradeBanner(false)}
                className="mt-3 text-xs text-muted-foreground/70 hover:text-muted-foreground/90 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <Spinner />
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

function Header({
  session,
  isPro,
  onMenuClick,
}: {
  session: ReturnType<typeof useSession>["data"];
  isPro: boolean;
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-border/40 transition-all duration-150"
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="text-lg font-extrabold tracking-tight">
            remy<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!isPro && session?.user && (
          <button
            onClick={() => router.push("/pricing")}
            className="hidden sm:flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-full px-3 py-1 transition-all duration-150 hover:bg-primary/5"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Upgrade
          </button>
        )}
        {isPro && (
          <button
            onClick={() => router.push("/pricing")}
            className="hidden sm:flex items-center gap-1.5 text-xs text-primary/80 border border-primary/30 rounded-full px-3 py-1 bg-primary/5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Pro
          </button>
        )}
        {session?.user && (
          <>
            <span className="text-xs text-muted-foreground/70 hidden sm:block">
              {session.user.name ?? session.user.email}
            </span>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="h-7 w-7 rounded-full border border-border/40"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/20">
                {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-muted-foreground/70 hover:text-muted-foreground/90 transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
