import { z } from "zod";

// One zod schema per tool. This is the actual security boundary: every
// tool_use input from Claude is parsed against these before it ever
// reaches the ExcelJS engine. Nothing here executes code or accepts
// free-form formulas/expressions — just bounded, typed arguments.

// A1-style cell reference, e.g. "B2".
const cellRefSchema = z
  .string()
  .regex(/^[A-Za-z]{1,3}[1-9][0-9]*$/, "Expected an A1-style cell reference like 'B2'");

// A1-style range, e.g. "A1:C10" or a single cell "A1".
const rangeRefSchema = z
  .string()
  .regex(
    /^[A-Za-z]{1,3}[1-9][0-9]*(:[A-Za-z]{1,3}[1-9][0-9]*)?$/,
    "Expected an A1-style range like 'A1:C10'"
  );

// A cell value the model may write. Deliberately excludes formulas:
// ExcelJS only creates a real formula from an object (`{ formula: ... }`)
// — a plain string like "=SUM(B2:B4)" is stored as literal text, so
// silently accepting it here would write a cell that looks right in
// the tool transcript but shows the wrong thing in Excel. Until
// set_formula exists, write_cell rejects formula-shaped strings so the
// model computes the value itself instead.
const cellValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.null()])
  .refine((v) => !(typeof v === "string" && v.trim().startsWith("=")), {
    message:
      "write_cell does not support formulas — a string starting with '=' would be stored as literal text, not a working formula. Compute the value yourself and write the plain result instead.",
  });

export const inspectWorkbookArgsSchema = z.object({});

export const readRangeArgsSchema = z.object({
  sheetName: z.string().min(1).max(120),
  range: rangeRefSchema,
});

export const aggregateRangeArgsSchema = z.object({
  sheetName: z.string().min(1).max(120),
  range: rangeRefSchema,
  operation: z.enum(["sum", "average", "count", "min", "max"]),
});

export const writeCellArgsSchema = z.object({
  sheetName: z.string().min(1).max(120),
  cell: cellRefSchema,
  value: cellValueSchema,
});

export const saveWorkbookArgsSchema = z.object({
  summary: z
    .string()
    .min(1)
    .max(500)
    .describe("One or two sentences describing what changed, shown to the user."),
});

export const TOOL_SCHEMAS = {
  inspect_workbook: inspectWorkbookArgsSchema,
  read_range: readRangeArgsSchema,
  aggregate_range: aggregateRangeArgsSchema,
  write_cell: writeCellArgsSchema,
  save_workbook: saveWorkbookArgsSchema,
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;

export function isToolName(name: string): name is ToolName {
  return Object.prototype.hasOwnProperty.call(TOOL_SCHEMAS, name);
}
