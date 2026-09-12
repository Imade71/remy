import type Anthropic from "@anthropic-ai/sdk";

// The tool contract shown to Claude. Kept hand-written and separate
// from schemas.ts (the zod runtime validators) on purpose: this is
// what the model sees and reasons about, that is what actually gates
// execution — they're allowed to describe the same shape without being
// mechanically the same object.
//
// Milestone 1 ships five tools: enough for Claude to orient itself in
// an unfamiliar workbook, read what's there, compute exact aggregates
// over it, make bounded edits, and signal it's done. list_sheets/
// inspect_sheet/add_column/set_formula/format_cells follow once real
// jobs show whether this set already covers them.
//
// aggregate_range exists because read_range + mental arithmetic is not
// reliable: testing on real data (341 rows, one column, 9 blanks) had
// Claude read the raw values back and sum them by eye, landing 45% off
// the true total. The model is good at deciding *what* to compute and
// *which* range — it should never be the one doing the arithmetic.

export const HANDLE_TOOLS: Anthropic.Tool[] = [
  {
    name: "inspect_workbook",
    description:
      "Get an overview of the uploaded workbook: every sheet's name and its used range (e.g. 'A1:D42'). Always call this first — before reading or writing anything — to see what sheets exist.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "read_range",
    description:
      "Read cell values from a rectangular range on one sheet. Returns a 2D array of values in row order. Use this to see existing data before deciding what to write.",
    input_schema: {
      type: "object",
      properties: {
        sheetName: { type: "string", description: "Exact sheet name, from inspect_workbook." },
        range: {
          type: "string",
          description: "A1-style range, e.g. 'A1:C10'. A single cell like 'B2' is also valid.",
        },
      },
      required: ["sheetName", "range"],
      additionalProperties: false,
    },
  },
  {
    name: "aggregate_range",
    description:
      "Compute an exact aggregate (sum, average, count, min, or max) over a range on one sheet, computed by the engine — not by you. Always use this instead of reading raw values and adding them up yourself, for any range beyond a handful of cells. Non-numeric and blank cells are silently skipped, matching how a spreadsheet's own SUM/AVERAGE would behave; the response tells you how many cells were actually numeric.",
    input_schema: {
      type: "object",
      properties: {
        sheetName: { type: "string", description: "Exact sheet name, from inspect_workbook." },
        range: {
          type: "string",
          description: "A1-style range, e.g. 'E2:E342'. Can cover an entire column of data.",
        },
        operation: {
          type: "string",
          enum: ["sum", "average", "count", "min", "max"],
          description: "Which aggregate to compute.",
        },
      },
      required: ["sheetName", "range", "operation"],
      additionalProperties: false,
    },
  },
  {
    name: "write_cell",
    description:
      "Write a single literal value into one cell. Overwrites whatever was there. Does NOT support formulas — a string like '=SUM(B2:B4)' would be stored as plain text, not a working formula, so compute the result yourself and write the plain number. This does not save the file — call save_workbook when all edits are done.",
    input_schema: {
      type: "object",
      properties: {
        sheetName: { type: "string", description: "Exact sheet name, from inspect_workbook." },
        cell: { type: "string", description: "A1-style cell reference, e.g. 'B2'." },
        value: {
          description: "The literal value to write: a string, number, boolean, or null to clear the cell. Not a formula.",
        },
      },
      required: ["sheetName", "cell", "value"],
      additionalProperties: false,
    },
  },
  {
    name: "save_workbook",
    description:
      "Finalize the job: writes out the modified workbook as a new file and ends the session. Call this exactly once, after all edits are made. Never call it before making the edits the user asked for.",
    input_schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "One or two plain-language sentences describing what you changed, shown to the user.",
        },
      },
      required: ["summary"],
      additionalProperties: false,
    },
  },
];
