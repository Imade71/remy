// Hard limits for Remy Handle jobs. Kept in one place so the route,
// the agent loop, and the engine all enforce the same numbers.
//
// These are deliberately conservative starting points for milestone 1
// (measuring real token cost on a real job) — tune once we have data.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_UPLOAD_EXTENSION = ".xlsx";
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Some browsers/OSes send a generic octet-stream for .xlsx; we still
  // gate on the file extension, this just isn't grounds to reject alone.
  "application/octet-stream",
];

// Applies to any single read_range/inspect_sheet-style response — caps
// both the memory footprint and (more importantly for milestone 1) how
// many tokens a single tool_result can cost.
export const MAX_CELLS_PER_READ = 5_000;
export const MAX_ROWS_PER_READ = 1_000;

// aggregate_range returns one number, not the underlying cells, so it
// doesn't cost tokens the way read_range does — it can safely cover a
// much bigger range. This cap exists only to bound engine work per
// call, not context size; MAX_UPLOAD_BYTES already keeps any workbook
// far under this in practice.
export const MAX_CELLS_PER_AGGREGATE = 200_000;
export const MAX_ROWS_PER_AGGREGATE = 100_000;

// Hard stop on the agent loop regardless of what Claude asks for next.
export const MAX_TOOL_CALLS = 25;

// Wall-clock budget for the whole job, checked between tool calls so a
// runaway loop exits with a clean error instead of hitting the
// platform's own timeout. Keep comfortably under `maxDuration` below.
export const MAX_JOB_DURATION_MS = 50_000;

// Route segment config value (seconds). Vercel Hobby caps at 60s;
// raise this (and upgrade the plan) once real jobs need more.
export const ROUTE_MAX_DURATION_SECONDS = 60;
