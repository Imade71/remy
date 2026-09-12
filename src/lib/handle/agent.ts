import Anthropic from "@anthropic-ai/sdk";
import { ExcelEngine } from "./engines/excel";
import { executeTool } from "./execute";
import { HANDLE_TOOLS } from "./tools";
import { MAX_JOB_DURATION_MS, MAX_TOOL_CALLS } from "./limits";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HANDLE_SYSTEM_PROMPT = `You are Remy Handle, a spreadsheet-editing agent.

You never write or output raw file contents, XML, or code. The only way you
can inspect or change the workbook is by calling the tools you've been
given — inspect_workbook, read_range, aggregate_range, write_cell,
save_workbook. Nothing else you say has any effect on the file.

Rules:
- Always call inspect_workbook first, before reading or writing anything,
  so you know what sheets and data actually exist. Never assume a sheet
  name or layout.
- Read the relevant range with read_range before writing over it, so you
  don't guess at what's already there.
- For any sum, average, count, minimum, or maximum over more than a
  handful of cells, always call aggregate_range instead of reading the
  raw values and computing it yourself. You are not reliable at exact
  arithmetic over many numbers — the engine is. Never state a computed
  total, average, or similar figure that didn't come from aggregate_range.
- Make the edits the user asked for using write_cell — one cell at a time.
- When you are done making every edit the request requires, call
  save_workbook exactly once with a short, plain-language summary of what
  you changed. This is the only way the job finishes successfully.
- If the request is ambiguous or the data doesn't match what was asked,
  make your best reasonable interpretation and say so in the save_workbook
  summary — don't ask a clarifying question, there is no further turn.
- Never call save_workbook before making the requested edits.`;

export type ToolCallLog = {
  tool: string;
  args: unknown;
  ok: boolean;
  resultOrError: unknown;
};

export type UsageTotals = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  requestCount: number;
};

export type HandleAgentResult =
  | {
      status: "saved";
      summary: string;
      transcript: ToolCallLog[];
      usage: UsageTotals;
      buffer: Buffer;
    }
  | {
      status: "error";
      error: string;
      transcript: ToolCallLog[];
      usage: UsageTotals;
    };

export async function runHandleAgent(
  instruction: string,
  fileBuffer: Buffer
): Promise<HandleAgentResult> {
  const usage: UsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
    requestCount: 0,
  };
  const transcript: ToolCallLog[] = [];
  const startedAt = Date.now();

  let engine: ExcelEngine;
  try {
    engine = await ExcelEngine.fromBuffer(fileBuffer);
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Could not open the uploaded file",
      transcript,
      usage,
    };
  }

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: instruction }];
  let toolCallCount = 0;

  while (true) {
    if (Date.now() - startedAt > MAX_JOB_DURATION_MS) {
      return { status: "error", error: "The job took too long and was stopped before saving.", transcript, usage };
    }
    if (toolCallCount >= MAX_TOOL_CALLS) {
      return {
        status: "error",
        error: `Reached the limit of ${MAX_TOOL_CALLS} tool calls without finishing. No changes were saved.`,
        transcript,
        usage,
      };
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: HANDLE_SYSTEM_PROMPT,
      tools: HANDLE_TOOLS,
      messages,
    });

    usage.requestCount += 1;
    usage.inputTokens += response.usage.input_tokens;
    usage.outputTokens += response.usage.output_tokens;
    usage.cacheCreationInputTokens += response.usage.cache_creation_input_tokens ?? 0;
    usage.cacheReadInputTokens += response.usage.cache_read_input_tokens ?? 0;

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      // Claude stopped talking without ever calling save_workbook — per
      // the architecture rule, nothing is finalized unless it explicitly
      // asked to save. Treat this as a failed job, not a silent success.
      return {
        status: "error",
        error: "Remy Handle finished without saving. No changes were made to your file.",
        transcript,
        usage,
      };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    let saved: { summary: string } | null = null;

    for (const block of toolUseBlocks) {
      toolCallCount += 1;
      const outcome = executeTool(engine, block.name, block.input);
      transcript.push({
        tool: block.name,
        args: block.input,
        ok: outcome.ok,
        resultOrError: outcome.ok ? outcome.result : outcome.error,
      });

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(outcome.ok ? outcome.result : { error: outcome.error }),
        is_error: !outcome.ok,
      });

      if (outcome.ok && outcome.saved) saved = outcome.saved;
    }

    if (saved) {
      try {
        const buffer = await engine.toBuffer();
        return { status: "saved", summary: saved.summary, transcript, usage, buffer };
      } catch (err) {
        return {
          status: "error",
          error: `Edits were made but the file could not be written out: ${err instanceof Error ? err.message : "unknown error"}`,
          transcript,
          usage,
        };
      }
    }

    messages.push({ role: "user", content: toolResults });
  }
}
