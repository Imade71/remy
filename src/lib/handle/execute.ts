import type { AggregateOperation, ExcelEngine } from "./engines/excel";
import { ExcelEngineError } from "./engines/excel";
import { TOOL_SCHEMAS, isToolName } from "./schemas";

export type ToolExecutionResult =
  | { ok: true; result: unknown; saved?: { summary: string } }
  | { ok: false; error: string };

// The single choke point every tool_use block passes through:
// unknown name -> rejected. Args that don't match the zod schema ->
// rejected before the engine ever sees them. Engine failures (bad
// sheet name, out-of-bounds range, corrupt file) -> caught and turned
// into a plain string, never an unhandled throw. Nothing here can run
// arbitrary code — it's a fixed switch over a fixed set of engine
// methods.
export function executeTool(
  engine: ExcelEngine,
  toolName: string,
  rawArgs: unknown
): ToolExecutionResult {
  if (!isToolName(toolName)) {
    return { ok: false, error: `Unknown tool '${toolName}'. This is not a tool Remy Handle supports.` };
  }

  const schema = TOOL_SCHEMAS[toolName];
  const parsed = schema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      error: `Invalid arguments for ${toolName}: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    };
  }

  try {
    switch (toolName) {
      case "inspect_workbook":
        return { ok: true, result: engine.inspectWorkbook() };

      case "read_range": {
        const { sheetName, range } = parsed.data as { sheetName: string; range: string };
        return { ok: true, result: engine.readRange(sheetName, range) };
      }

      case "aggregate_range": {
        const { sheetName, range, operation } = parsed.data as {
          sheetName: string;
          range: string;
          operation: AggregateOperation;
        };
        return { ok: true, result: engine.aggregateRange(sheetName, range, operation) };
      }

      case "write_cell": {
        const { sheetName, cell, value } = parsed.data as {
          sheetName: string;
          cell: string;
          value: string | number | boolean | null;
        };
        return { ok: true, result: engine.writeCell(sheetName, cell, value) };
      }

      case "save_workbook": {
        const { summary } = parsed.data as { summary: string };
        return { ok: true, result: { saved: true, summary }, saved: { summary } };
      }
    }
  } catch (err) {
    if (err instanceof ExcelEngineError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error executing tool" };
  }
}
