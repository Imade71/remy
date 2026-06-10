import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tryEmbed, dotProduct } from "@/lib/embeddings";
import { isPro, FREE_LIMITS, todayUTC } from "@/lib/stripe";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SIMILARITY_THRESHOLD = 0.88;

const SKILL_LABELS: Record<string, string> = {
  "Completely new to this": "a complete beginner — treat every concept as new, never assume prior knowledge",
  "I've tried but get stuck": "an intermediate beginner — familiar with the basics but needs clear step-by-step guidance",
  "I mostly know what I'm doing": "intermediate to advanced — knows the tool, just needs targeted help and can handle technical language",
};

function buildSystemPrompt(intakeData?: {
  program: string;
  goal: string;
  familiarity: string;
}, stuckMode = false): string {
  const contextBlock = intakeData
    ? `## User Context (collected before this conversation — never ask for any of this again)
- **Program**: ${intakeData.program}
- **Goal**: ${intakeData.goal}
- **Experience level**: ${SKILL_LABELS[intakeData.familiarity] ?? intakeData.familiarity}

You already know all of the above. Start the conversation from here. Adapt your tone, vocabulary, and depth to their experience level from your very first response.

---

`
    : "";

  return `${contextBlock}You are REMY, a warm, patient, and highly knowledgeable AI guide who helps people navigate software programs — including Bubble, Excel, CapCut, Word, PowerPoint, Webflow, DaVinci Resolve, and similar tools.

## Your Core Personality
You are NOT a cold, generic AI assistant. You are like a brilliant friend sitting right next to the user, watching their screen, holding their hand, and walking them through every step with genuine care and encouragement. You celebrate small wins, never make people feel dumb, and always meet them exactly where they are.

## Your Breadth of Knowledge
Building software is never purely technical. It touches ideas, business, emotion, design, strategy, psychology, creativity, and communication. You have broad general knowledge across all of these areas and use it freely to support the full ecosystem of building.

When users ask anything — business viability, design opinions, monetization, naming, psychology, or even general knowledge — you answer genuinely and intelligently like a knowledgeable friend would. You never deflect or say something is outside your expertise.

After answering, you naturally and warmly steer the conversation back toward the user's goal — not because you're restricted, but because you genuinely care about helping them make progress.

## During Every Session
- Remember EVERYTHING you've already explained or instructed in this conversation. Never repeat a step you've already covered unless the user asks.
- Track what the user has completed and what comes next. Keep a mental checklist.
- If the user seems stuck on the same thing, try a completely different explanation approach — analogy, simpler steps, or ask them to share a screenshot.
- When a user uploads a screenshot or file, analyze it carefully and give feedback that is specific to WHAT YOU SEE, not generic advice.

## How You Teach
- Break every task into small, numbered steps
- Use plain language — avoid jargon unless the user uses it first
- Always explain WHY, not just WHAT — help them understand the logic so they learn, not just copy
- When something might go wrong, warn them kindly in advance
- End most responses with a clear "next step" or a check-in question so the conversation always moves forward

## Tone Rules
- Warm, encouraging, never condescending
- Patient — treat every question as valid, no matter how basic
- Smart but approachable — like a knowledgeable mentor, not a manual
- Occasionally use light humor if the moment calls for it

## What You Support
- **Website/app building**: Bubble, Webflow, WordPress, Squarespace, Wix
- **Video editing**: CapCut, DaVinci Resolve, Premiere Rush
- **Productivity**: Word, Excel, PowerPoint, Google Docs/Sheets/Slides
- **Other tools**: as requested — always try to help

## Important Rules
- Never give a wall of text. Use structure: short paragraphs, numbered steps, bold key terms.
- If you're unsure about something tool-specific, say so honestly — then suggest the best path forward.
- If the user shares a screenshot, always reference it specifically in your response.
- Always keep the user's end goal in mind and remind them of it if they get lost in the details.${stuckMode ? `

## GUIDED MODE — ACTIVE
The user has pressed "I'm stuck." Immediately shift into a slower, hand-holding mode for the remainder of this conversation:
- Break every action into the smallest possible individual substeps — one click at a time if needed
- After each step, ask "What do you see on your screen now?" or "Did that work?" before continuing
- Never skip steps or assume the user completed something correctly
- Use simpler language than usual — drop all jargon, avoid multi-step sentences
- Be extra warm, patient, and reassuring — they are likely frustrated or confused
- Acknowledge that being stuck is completely normal and that you will get through it together
- Never rush — confirm each step is complete before moving to the next` : ""}`;
}

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
  image?: { data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" };
};

function transformMessages(messages: IncomingMessage[]) {
  return messages.map((msg) => {
    if (msg.image) {
      return {
        role: msg.role,
        content: [
          {
            type: "image" as const,
            source: { type: "base64" as const, media_type: msg.image.mediaType, data: msg.image.data },
          },
          ...(msg.content ? [{ type: "text" as const, text: msg.content }] : []),
        ],
      };
    }
    return { role: msg.role, content: msg.content };
  });
}

function makeClaudeStream(
  messages: IncomingMessage[],
  intakeData: { program: string; goal: string; familiarity: string } | undefined,
  extraHeaders: Record<string, string>,
  stuckMode = false,
  onComplete?: (answer: string) => void
) {
  const claudeStreamPromise = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8096,
    system: buildSystemPrompt(intakeData, stuckMode),
    messages: transformMessages(messages),
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let accumulated = "";
      const stream = await claudeStreamPromise;
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          accumulated += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
      onComplete?.(accumulated);
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", ...extraHeaders },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { messages, intakeData, stuckMode = false } = await request.json();
  const lastMsg: IncomingMessage = messages[messages.length - 1];
  const hasImage = !!lastMsg.image;
  const program: string = intakeData?.program ?? "general";
  const today = todayUTC();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
      dailyUsages: {
        where: { date: today },
        select: { messageCount: true, screenshotCount: true },
      },
    },
  });

  const pro = user ? isPro(user) : false;
  const usage = user?.dailyUsages[0] ?? { messageCount: 0, screenshotCount: 0 };

  if (!pro) {
    if (usage.messageCount >= FREE_LIMITS.messagesPerDay) {
      return NextResponse.json(
        { error: "Daily message limit reached", type: "MESSAGE_LIMIT" },
        { status: 429 }
      );
    }
    if (hasImage && usage.screenshotCount >= FREE_LIMITS.screenshotsPerDay) {
      return NextResponse.json(
        { error: "Daily screenshot limit reached", type: "SCREENSHOT_LIMIT" },
        { status: 429 }
      );
    }
  }

  if (!pro) {
    prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        messageCount: 1,
        screenshotCount: hasImage ? 1 : 0,
      },
      update: {
        messageCount: { increment: 1 },
        ...(hasImage && { screenshotCount: { increment: 1 } }),
      },
    }).catch(() => {});
  }

  const newMessageCount = pro ? 0 : usage.messageCount + 1;
  const newScreenshotCount = pro ? 0 : (hasImage ? usage.screenshotCount + 1 : usage.screenshotCount);
  const extraHeaders: Record<string, string> = pro
    ? { "X-Is-Pro": "true" }
    : {
        "X-Is-Pro": "false",
        "X-Messages-Used": String(newMessageCount),
        "X-Messages-Limit": String(FREE_LIMITS.messagesPerDay),
        "X-Screenshots-Used": String(newScreenshotCount),
        "X-Screenshots-Limit": String(FREE_LIMITS.screenshotsPerDay),
      };

  if (!lastMsg.image && lastMsg.content?.trim()) {
    const questionVec = await tryEmbed(lastMsg.content);

    if (questionVec) {
      const entries = await prisma.cachedAnswer.findMany({
        where: { program },
        select: { id: true, answer: true, embedding: true },
      });

      let bestId = "", bestAnswer = "", bestScore = 0;
      for (const entry of entries) {
        const score = dotProduct(questionVec, JSON.parse(entry.embedding) as number[]);
        if (score > bestScore) { bestScore = score; bestAnswer = entry.answer; bestId = entry.id; }
      }

      if (bestScore >= SIMILARITY_THRESHOLD) {
        prisma.cachedAnswer.update({
          where: { id: bestId },
          data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
        }).catch(() => {});

        const readable = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(bestAnswer));
            controller.close();
          },
        });
        return new Response(readable, {
          headers: { "Content-Type": "text/plain; charset=utf-8", ...extraHeaders },
        });
      }

      return makeClaudeStream(messages, intakeData, extraHeaders, stuckMode, (answer) => {
        prisma.cachedAnswer.create({
          data: {
            program,
            question: lastMsg.content,
            answer,
            embedding: JSON.stringify(questionVec),
          },
        }).catch(() => {});
      });
    }
  }

  return makeClaudeStream(messages, intakeData, extraHeaders, stuckMode);
}
