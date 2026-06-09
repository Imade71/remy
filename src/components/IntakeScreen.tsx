"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PROGRAMS = [
  "Bubble",
  "Excel",
  "CapCut",
  "Word",
  "PowerPoint",
  "Webflow",
  "DaVinci Resolve",
  "Other",
];

const FAMILIARITY = [
  { label: "Completely new to this", description: "Haven't opened it yet" },
  { label: "I've tried but get stuck", description: "Some experience, needs guidance" },
  { label: "I mostly know what I'm doing", description: "Just need targeted help" },
];

const CHIPS = [
  "Build an app",
  "Create a dashboard",
  "Learn the basics",
  "Fix a workflow",
  "Build a marketplace",
];

const REASSURANCE = "No technical experience needed. We'll guide you step by step.";

export interface IntakeData {
  program: string;
  goal: string;
  familiarity: string;
}

interface IntakeScreenProps {
  onComplete: (data: IntakeData) => void;
}

type Step = 1 | 2 | 3 | "summary" | "loading";

export function IntakeScreen({ onComplete }: IntakeScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [animKey, setAnimKey] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [program, setProgram] = useState("");
  const [goal, setGoal] = useState("");
  const [familiarity, setFamiliarity] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  function transition(fn: () => void) {
    setExiting(true);
    setTimeout(() => {
      fn();
      setAnimKey((k) => k + 1);
      setExiting(false);
    }, 220);
  }

  function handleProgramSelect(p: string) {
    setSelectedProgram(p);
    setTimeout(() => {
      setProgram(p);
      transition(() => setStep(2));
    }, 110);
  }

  function handleGoalContinue() {
    if (!goal.trim()) return;
    transition(() => setStep(3));
  }

  function handleBack() {
    if (step === 2) transition(() => setStep(1));
    else if (step === 3) transition(() => setStep(2));
  }

  function handleFamiliaritySelect(f: string) {
    setFamiliarity(f);
    transition(() => setStep("summary"));
  }

  useEffect(() => {
    if (step === "summary") {
      const t = setTimeout(() => transition(() => setStep("loading")), 2300);
      return () => clearTimeout(t);
    }
    if (step === "loading") {
      const t = setTimeout(
        () => onComplete({ program, goal: goal.trim(), familiarity }),
        2000
      );
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const getProgress = () => {
    if (step === "summary" || step === "loading") return 100;
    return (step / 3) * 100;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="h-px w-full bg-border/15 overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${getProgress()}%`,
            background: "oklch(0.62 0.17 235)",
            boxShadow:
              "0 0 5px 1px oklch(0.62 0.17 235 / 0.25), 0 0 1px 0 oklch(0.62 0.17 235 / 0.5)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 overflow-y-auto">
        <div
          key={animKey}
          className={cn(
            "w-full max-w-md",
            exiting
              ? "opacity-0 -translate-x-4 transition-all duration-[220ms] ease-in pointer-events-none"
              : "animate-in fade-in-0 slide-in-from-right-3 duration-300 ease-out"
          )}
        >
          {/* ── Step 1: Program ── */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[11px] text-muted-foreground/40 tracking-widest uppercase">
                  Step 1 of 3
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  What program do you need help with?
                </h2>
                <p className="text-xs text-muted-foreground/40 mt-1">No wrong answers.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PROGRAMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProgramSelect(p)}
                    className={cn(
                      "rounded-2xl border px-5 py-4 text-sm font-medium text-left transition-all duration-200 backdrop-blur-sm",
                      selectedProgram === p
                        ? "border-primary/70 bg-primary/15 text-primary shadow-lg shadow-primary/20 scale-[1.02]"
                        : "border-border/50 bg-card/60 hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/15 hover:scale-[1.02] active:scale-[0.97]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/35 text-center">{REASSURANCE}</p>
            </div>
          )}

          {/* ── Step 2: Goal ── */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[11px] text-muted-foreground/40 tracking-widest uppercase">
                  Step 2 of 3
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  What are you trying to do?
                </h2>
                <p className="text-sm text-muted-foreground/45">
                  Even a rough idea is enough.
                </p>
              </div>
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGoalContinue();
                    }
                  }}
                  placeholder="e.g. Build a booking app, create a monthly budget tracker…"
                  rows={3}
                  className="w-full rounded-2xl border border-border/50 bg-card/60 px-5 py-4 text-sm leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:shadow-sm focus:shadow-primary/10 resize-none transition-all duration-200 backdrop-blur-sm"
                />

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setGoal(chip)}
                      className="rounded-full border border-border/40 bg-card/40 px-3.5 py-1.5 text-xs text-muted-foreground/60 transition-all duration-200 hover:border-primary/55 hover:bg-primary/12 hover:text-primary hover:shadow-sm hover:shadow-primary/12 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Continue — fades in once user starts typing */}
                <button
                  onClick={handleGoalContinue}
                  className={cn(
                    "w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300",
                    goal.trim()
                      ? "opacity-100 translate-y-0 pointer-events-auto shadow-lg shadow-primary/25 hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.01]"
                      : "opacity-0 translate-y-2 pointer-events-none shadow-none"
                  )}
                >
                  Continue
                </button>

                <button
                  onClick={handleBack}
                  className="w-full text-xs text-muted-foreground/45 hover:text-muted-foreground/70 transition-colors py-1"
                >
                  ← Previous
                </button>

                <p className="text-xs text-muted-foreground/35 text-center">{REASSURANCE}</p>
              </div>
            </div>
          )}

          {/* ── Step 3: Familiarity ── */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[11px] text-muted-foreground/40 tracking-widest uppercase">
                  Step 3 of 3
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  How familiar are you with {program}?
                </h2>
                <p className="text-xs text-muted-foreground/40">
                  No wrong answers — you can change this later.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {FAMILIARITY.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => handleFamiliaritySelect(f.label)}
                    className="rounded-2xl border border-border/50 bg-card/60 px-5 py-4 text-left transition-all duration-200 hover:border-primary/60 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/15 hover:scale-[1.02] active:scale-[0.99] backdrop-blur-sm"
                  >
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">{f.description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleBack}
                className="w-full text-xs text-muted-foreground/45 hover:text-muted-foreground/70 transition-colors py-1"
              >
                ← Previous
              </button>

              <p className="text-xs text-muted-foreground/35 text-center">{REASSURANCE}</p>
            </div>
          )}

          {/* ── Summary ── */}
          {step === "summary" && (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[11px] text-primary/55 tracking-widest uppercase font-medium">
                  Remy understood you
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">Here&apos;s what I&apos;ve got</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Program", value: program },
                  { label: "Goal", value: goal },
                  { label: "Experience", value: familiarity },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/50 bg-card/60 px-5 py-4 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both"
                    style={{ animationDelay: `${i * 160}ms` }}
                  >
                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {step === "loading" && (
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Remy is preparing your workspace…
                </h2>
                <p className="text-sm text-muted-foreground/40">Just a moment</p>
              </div>
              <div className="flex gap-2.5 items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: `${i * 280}ms`, animationDuration: "1.4s" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
