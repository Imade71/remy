"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { IntakeScreen, type IntakeData } from "@/components/IntakeScreen";
import { AuthScreen } from "@/components/AuthScreen";
import type { MessageImage } from "@/components/ChatInterface";

interface StoredMessage {
  id: string;
  role: string;
  content: string;
  imageData: string | null;
  imageMediaType: string | null;
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

export default function Home() {
  const { data: session, status } = useSession();
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [initialMessages, setInitialMessages] = useState<Array<{ role: "user" | "assistant"; content: string; image?: MessageImage }> | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    setDataLoading(true);

    Promise.all([
      fetch("/api/intake").then((r) => r.json()),
      fetch("/api/messages").then((r) => r.json()),
    ]).then(([intake, messages]) => {
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

  if (status === "loading" || (session && dataLoading)) {
    return (
      <main className="flex flex-col h-full">
        <Header session={session} />
        <div className="flex-1 overflow-hidden">
          <Spinner />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col h-full">
        <Header session={null} />
        <div className="flex-1 overflow-hidden">
          <AuthScreen />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-full">
      <Header session={session} />
      <div className="flex-1 overflow-hidden">
        <div
          key={intakeData ? "chat" : "intake"}
          className="h-full animate-in fade-in-0 duration-500"
        >
          {intakeData && initialMessages !== null ? (
            <ChatInterface intakeData={intakeData} initialMessages={initialMessages} />
          ) : (
            <IntakeScreen onComplete={handleIntakeComplete} />
          )}
        </div>
      </div>
    </main>
  );
}

function Header({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          R
        </div>
        <span className="font-semibold text-sm tracking-wide">REMY</span>
      </div>
      {session?.user && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/50 hidden sm:block">
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
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
