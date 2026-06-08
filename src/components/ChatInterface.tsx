"use client";

import { useEffect, useRef, useState } from "react";
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

interface ChatInterfaceProps {
  intakeData?: IntakeData;
}

export function ChatInterface({ intakeData }: ChatInterfaceProps) {
  const welcomeMessage: Message | null = intakeData
    ? {
        role: "assistant",
        content: `So you're working on **${intakeData.goal}** in **${intakeData.program}** — great choice. No rush, no pressure. Where would you like to begin?`,
      }
    : null;

  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage ? [welcomeMessage] : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<MessageImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleFileSelect(file: File) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) return;
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

  async function sendMessage() {
    const trimmed = input.trim();
    if ((!trimmed && !pendingImage) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      ...(pendingImage && { image: pendingImage }),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, intakeData }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setInput("");
    setPendingImage(null);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full">
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

      {/* Input area */}
      <div className="border-t border-border/50 bg-background/90 backdrop-blur-md px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div
            className={cn(
              "relative flex flex-col rounded-2xl border border-border/40 bg-card/60 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-primary/10 focus-within:shadow-xl",
              isDragging && "border-primary/70 bg-primary/5 shadow-primary/20 shadow-xl"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                <p className="text-primary text-sm font-medium">Drop image to attach</p>
              </div>
            )}

            {/* Image preview */}
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

            {/* Input row */}
            <div className="flex items-end gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "group shrink-0 mb-0.5 h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-150 disabled:opacity-30",
                  pendingImage
                    ? "text-primary bg-primary/15 border-primary/50 shadow-[0_0_10px_2px] shadow-primary/40"
                    : "text-primary/60 hover:text-primary hover:bg-primary/12 border-transparent hover:border-primary/25"
                )}
                title="Attach image or screenshot"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-150 group-hover:scale-110">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to do next, or ask me for guidance..."
                className="flex-1 resize-none min-h-[36px] max-h-[180px] border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:border-0 px-0 py-0.5 placeholder:text-muted-foreground/35 leading-relaxed"
                rows={1}
                disabled={isLoading}
              />

              <Button
                onClick={sendMessage}
                disabled={(!input.trim() && !pendingImage) || isLoading}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-full mb-0.5 transition-all duration-200 disabled:opacity-25"
              >
                {isLoading ? (
                  <span className="flex gap-[3px] items-center">
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
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

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors duration-200 self-center"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
