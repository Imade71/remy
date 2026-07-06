"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeData } from "./IntakeScreen";
import { cn } from "@/lib/utils";

export interface MessageImage {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  previewUrl: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: MessageImage;
}

interface UsageState {
  isPro: boolean;
  messagesUsed: number;
  messagesLimit: number;
  screenshotsUsed: number;
  screenshotsLimit: number;
}

interface ChatInterfaceProps {
  intakeData?: IntakeData;
  initialMessages?: Message[];
  initialUsage?: UsageState;
}

const FREE_MSG_LIMIT = 30;
const FREE_SCREENSHOT_LIMIT = 3;
const WARN_THRESHOLD = 5;

export function ChatInterface({ intakeData, initialMessages, initialUsage }: ChatInterfaceProps) {
  const router = useRouter();

  const welcomeMessage: Message | null =
    intakeData && (!initialMessages || initialMessages.length === 0)
      ? {
          role: "assistant",
          content: `So you're working on **${intakeData.goal}** in **${intakeData.program}** — great choice. No rush, no pressure. Where would you like to begin?`,
        }
      : null;

  const [messages, setMessages] = useState<Message[]>(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : welcomeMessage
      ? [welcomeMessage]
      : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<MessageImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [usage, setUsage] = useState<UsageState>(
    initialUsage ?? {
      isPro: false,
      messagesUsed: 0,
      messagesLimit: FREE_MSG_LIMIT,
      screenshotsUsed: 0,
      screenshotsLimit: FREE_SCREENSHOT_LIMIT,
    }
  );
  const [limitError, setLimitError] = useState<"MESSAGE_LIMIT" | "SCREENSHOT_LIMIT" | null>(null);
  const [isStuckMode, setIsStuckMode] = useState(false);
  const [hasUsedScreenshot, setHasUsedScreenshot] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (localStorage.getItem("remy_screenshot_used")) setHasUsedScreenshot(true);
  }, []);

  const messagesRemaining = usage.isPro ? Infinity : usage.messagesLimit - usage.messagesUsed;
  const screenshotsRemaining = usage.isPro ? Infinity : usage.screenshotsLimit - usage.screenshotsUsed;
  const atMessageLimit = !usage.isPro && messagesRemaining <= 0;
  const atScreenshotLimit = !usage.isPro && screenshotsRemaining <= 0;
  const nearMessageLimit = !usage.isPro && messagesRemaining > 0 && messagesRemaining <= WARN_THRESHOLD;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showScreenshotHint = !hasUsedScreenshot && !atScreenshotLimit && !pendingImage && !atMessageLimit && userMessageCount < 4;

  function handleFileSelect(file: File) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) return;

    if (!usage.isPro && screenshotsRemaining <= 0) {
      setLimitError("SCREENSHOT_LIMIT");
      return;
    }

    if (!hasUsedScreenshot) {
      setHasUsedScreenshot(true);
      localStorage.setItem("remy_screenshot_used", "1");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPendingImage({
        data: result.split(",")[1],
        mediaType: file.type as MessageImage["mediaType"],
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function sendMessage(forceContent?: string, forceStuckMode?: boolean) {
    const trimmed = forceContent ?? input.trim();
    if ((!trimmed && !pendingImage) || isLoading) return;
    if (atMessageLimit) { setLimitError("MESSAGE_LIMIT"); return; }
    if (pendingImage && atScreenshotLimit) { setLimitError("SCREENSHOT_LIMIT"); return; }

    setLimitError(null);

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      ...(pendingImage && { image: pendingImage }),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    if (!forceContent) setInput("");
    setPendingImage(null);
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, intakeData, stuckMode: forceStuckMode ?? isStuckMode }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setLimitError(data.type as "MESSAGE_LIMIT" | "SCREENSHOT_LIMIT");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!response.ok) throw new Error("Failed to get response");

      // Read usage headers
      const isPro = response.headers.get("X-Is-Pro") === "true";
      if (!isPro) {
        const mu = response.headers.get("X-Messages-Used");
        const ml = response.headers.get("X-Messages-Limit");
        const su = response.headers.get("X-Screenshots-Used");
        const sl = response.headers.get("X-Screenshots-Limit");
        if (mu && ml && su && sl) {
          setUsage({
            isPro: false,
            messagesUsed: parseInt(mu),
            messagesLimit: parseInt(ml),
            screenshotsUsed: parseInt(su),
            screenshotsLimit: parseInt(sl),
          });
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let finalAssistantContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        finalAssistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }

      const toSave: Message[] = [
        userMessage,
        { role: "assistant", content: finalAssistantContent },
      ];
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSave }),
      }).catch(() => {});
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleStuck() {
    setIsStuckMode(true);
    sendMessage("I'm stuck — can you walk me through this step by step, more slowly?", true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageItem = Array.from(e.clipboardData.items).find(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    );
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (file) {
      e.preventDefault();
      handleFileSelect(file);
    }
  }

  function clearChat() {
    setMessages([]);
    setInput("");
    setPendingImage(null);
    setLimitError(null);
    textareaRef.current?.focus();
    fetch("/api/messages", { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="flex flex-col h-full">
      {/* Limit reached modal */}
      {limitError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 flex flex-col gap-5 shadow-2xl text-center animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1.5">
                {limitError === "MESSAGE_LIMIT" ? "Daily message limit reached" : "Daily screenshot limit reached"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {limitError === "MESSAGE_LIMIT"
                  ? "You've used all 30 free messages today. Upgrade to REMY Pro for unlimited messages."
                  : "You've used all 3 free screenshot uploads today. Upgrade to REMY Pro for unlimited uploads."}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => router.push("/pricing")}
                className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Upgrade to REMY Pro — $19/mo
              </button>
              <button
                onClick={() => setLimitError(null)}
                className="text-xs text-muted-foreground/70 hover:text-muted-foreground/90 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-glow-breathe" />
              <div className="absolute h-28 w-28 rounded-full bg-primary/30 blur-2xl animate-glow-breathe-inner [animation-delay:0.4s]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-3xl font-bold text-primary shadow-2xl shadow-primary/40">
                R
              </div>
            </div>
            <div className="space-y-2.5">
              <h2 className="text-2xl font-semibold tracking-tight">Hi, I&apos;m REMY</h2>
              <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed">
                Your intelligent guide. Ask me anything — I&apos;m here to help you navigate any software with confidence.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-6">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={
                  isLoading && i === messages.length - 1 && msg.role === "assistant"
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Warning banner */}
      {nearMessageLimit && (
        <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-amber-500/80">
              {messagesRemaining === 1
                ? "1 message left today on the free plan."
                : `${messagesRemaining} messages left today on the free plan.`}
            </p>
            <button
              onClick={() => router.push("/pricing")}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors shrink-0"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border/50 bg-background/90 backdrop-blur-md px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div
            className={cn(
              "relative flex flex-col rounded-2xl border border-border/40 bg-card/60 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-primary/10 focus-within:shadow-xl",
              isDragging && "border-primary/70 bg-primary/5 shadow-primary/20 shadow-xl",
              atMessageLimit && "opacity-60"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                <p className="text-primary text-sm font-medium">Drop image to attach</p>
              </div>
            )}

            {pendingImage && (
              <div className="px-3 pt-3">
                <div className="relative inline-block">
                  <img
                    src={pendingImage.previewUrl}
                    alt="Attached screenshot"
                    className="h-24 w-24 object-cover rounded-xl border border-border/60"
                  />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-background border border-border/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 px-3 py-2.5">
              <div className="relative shrink-0 mb-0.5">
                {showScreenshotHint && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={() => atScreenshotLimit ? setLimitError("SCREENSHOT_LIMIT") : fileInputRef.current?.click()}
                  disabled={isLoading || atMessageLimit}
                  className={cn(
                    "group h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-150 disabled:opacity-30",
                    pendingImage
                      ? "text-primary bg-primary/15 border-primary/50 shadow-[0_0_10px_2px] shadow-primary/40"
                      : atScreenshotLimit
                      ? "text-amber-500/60 border-amber-500/20"
                      : showScreenshotHint
                      ? "text-primary/80 border-primary/30 bg-primary/8"
                      : "text-primary/60 hover:text-primary hover:bg-primary/12 border-transparent hover:border-primary/25"
                  )}
                  title={atScreenshotLimit ? "Screenshot limit reached — upgrade to Pro" : "Attach image or screenshot"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-150 group-hover:scale-110">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </button>
              </div>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={atMessageLimit ? "Daily limit reached — upgrade to keep going" : "Describe what you want to do next, or ask me for guidance..."}
                className="flex-1 resize-none min-h-[36px] max-h-[180px] border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:border-0 px-0 py-0.5 placeholder:text-muted-foreground/35 leading-relaxed"
                rows={1}
                disabled={isLoading || atMessageLimit}
              />

              <Button
                onClick={atMessageLimit ? () => router.push("/pricing") : () => sendMessage()}
                disabled={atMessageLimit ? false : ((!input.trim() && !pendingImage) || isLoading)}
                size="icon"
                className={cn("shrink-0 h-9 w-9 rounded-full mb-0.5 transition-all duration-200 disabled:opacity-25", atMessageLimit && "bg-amber-500 hover:bg-amber-400")}
              >
                {isLoading ? (
                  <span className="flex gap-[3px] items-center">
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
                ) : atMessageLimit ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleStuck}
                  disabled={isLoading}
                  className={cn(
                    "text-xs font-medium rounded-lg px-3 py-1.5 transition-colors duration-200 disabled:opacity-40 shadow-sm",
                    isStuckMode
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                  )}
                >
                  {isStuckMode ? "Guided mode on" : "I'm stuck"}
                </button>
              )}
            </div>

            {!usage.isPro && (
              <p className="text-xs text-muted-foreground/70">
                {messagesRemaining === Infinity ? "" : `${messagesRemaining} of ${usage.messagesLimit} messages left today`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
