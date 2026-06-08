"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { IntakeScreen, type IntakeData } from "@/components/IntakeScreen";

export default function Home() {
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);

  return (
    <main className="flex flex-col h-full">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            R
          </div>
          <span className="font-semibold text-sm tracking-wide">REMY</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div
          key={intakeData ? "chat" : "intake"}
          className="h-full animate-in fade-in-0 duration-500"
        >
          {intakeData ? (
            <ChatInterface intakeData={intakeData} />
          ) : (
            <IntakeScreen onComplete={setIntakeData} />
          )}
        </div>
      </div>
    </main>
  );
}
