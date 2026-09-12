import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isHandleEnabledForUser } from "@/lib/handle/access";
import { runHandleAgent } from "@/lib/handle/agent";
import { ALLOWED_UPLOAD_EXTENSION, MAX_UPLOAD_BYTES } from "@/lib/handle/limits";

// Needs Node APIs (Buffer, ExcelJS) and more time than a typical chat
// turn — kept on its own route so this doesn't affect /api/chat's config.
//
// Route segment config values must be literals Next.js can statically
// analyze at build time — importing maxDuration from a shared constant
// compiles and typechecks fine locally but fails on Vercel at
// "Collecting page data" with "Invalid segment configuration export
// detected", since the build can no longer see a literal number here.
// 60 is the Vercel Hobby plan's cap; raise this only after upgrading.
export const runtime = "nodejs";
export const maxDuration = 60;

// Milestone 1: upload + instruction + execute + save, in one request.
// No conversation history, no Sidebar/Conversation wiring, no Stripe
// tier yet — the goal is a real token-cost number on one real job.
//
//   curl -X POST http://localhost:3000/api/handle \
//     -H "Cookie: <session cookie>" \
//     -F "file=@workbook.xlsx" \
//     -F "instruction=Put the sum of column B into C1"
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isHandleEnabledForUser(session.user.email)) {
    return NextResponse.json({ error: "Remy Handle isn't available on your account yet" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with 'file' and 'instruction'" }, { status: 400 });
  }

  const file = formData.get("file");
  const instruction = formData.get("instruction");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' — attach one .xlsx file" }, { status: 400 });
  }
  if (typeof instruction !== "string" || !instruction.trim()) {
    return NextResponse.json({ error: "Missing 'instruction' — describe what to change" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(ALLOWED_UPLOAD_EXTENSION)) {
    return NextResponse.json({ error: `Only ${ALLOWED_UPLOAD_EXTENSION} files are supported right now` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File is too large (${Math.round(file.size / 1024 / 1024)} MB). The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` },
      { status: 400 }
    );
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const jobId = crypto.randomUUID();

  // Store the untouched upload first. The agent below only ever works
  // on an in-memory parse of this buffer — this blob is never
  // overwritten, matching "never modify the original" at the storage
  // layer as well as the workbook layer.
  try {
    await put(`handle/${session.user.id}/${jobId}/original.xlsx`, originalBuffer, {
      access: "private",
      addRandomSuffix: false,
    });
  } catch (err) {
    console.error("Remy Handle: failed to store original upload", err);
    return NextResponse.json({ error: "Could not store the uploaded file. Please try again." }, { status: 502 });
  }

  const result = await runHandleAgent(instruction.trim(), originalBuffer);

  if (result.status === "error") {
    return NextResponse.json(
      {
        error: result.error,
        transcript: result.transcript,
        usage: result.usage,
      },
      { status: 422 }
    );
  }

  let resultBlobUrl: string;
  try {
    const blob = await put(`handle/${session.user.id}/${jobId}/result.xlsx`, result.buffer, {
      access: "private",
      addRandomSuffix: false,
    });
    resultBlobUrl = blob.url;
  } catch (err) {
    console.error("Remy Handle: failed to store result", err);
    return NextResponse.json({ error: "Edits succeeded but the result could not be saved. Please try again." }, { status: 502 });
  }

  // Milestone 1 has no download-proxy route yet (the blob is private),
  // so the modified file is handed back directly in this response —
  // the client saves result.buffer to disk. resultBlobUrl is kept for
  // the audit trail / future re-download support.
  return NextResponse.json({
    jobId,
    summary: result.summary,
    resultBlobUrl,
    fileName: file.name.replace(/\.xlsx$/i, "") + " (edited).xlsx",
    fileBase64: result.buffer.toString("base64"),
    transcript: result.transcript,
    usage: result.usage,
  });
}
