"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: { previewUrl: string };
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 py-3 animate-message-in",
        isUser && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isUser
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
            : "bg-card border border-border/80 text-muted-foreground"
        )}
      >
        {isUser ? "U" : "R"}
      </div>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "max-w-[76%] bg-primary text-primary-foreground rounded-3xl shadow-lg shadow-primary/15"
            : "max-w-[60%] bg-card border border-border/50 text-foreground rounded-3xl shadow-sm"
        )}
      >
        {isUser ? (
          <div className="space-y-2">
            {message.image && (
              <img
                src={message.image.previewUrl}
                alt="Attached screenshot"
                className="max-w-full rounded-xl border border-white/10"
              />
            )}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none break-words prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-headings:font-semibold prose-headings:tracking-tight prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-blockquote:my-2 prose-code:before:content-none prose-code:after:content-none prose-code:bg-white/8 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-white/5 prose-pre:text-xs prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="ml-1.5 inline-flex gap-[3px] items-center align-middle">
            <span className="h-1 w-1 rounded-full bg-current animate-bounce opacity-50" style={{ animationDelay: "0ms" }} />
            <span className="h-1 w-1 rounded-full bg-current animate-bounce opacity-50" style={{ animationDelay: "120ms" }} />
            <span className="h-1 w-1 rounded-full bg-current animate-bounce opacity-50" style={{ animationDelay: "240ms" }} />
          </span>
        )}
      </div>
    </div>
  );
}
