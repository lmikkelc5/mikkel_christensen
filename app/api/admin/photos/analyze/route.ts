import { NextResponse } from "next/server";

import { analyzeUploads } from "@/lib/admin-photos";
import { requireAdminApi } from "@/lib/auth";
import type { UploadSignature } from "@/lib/photo-duplicates";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = (await request.json()) as { files?: UploadSignature[] };
  const files = Array.isArray(body.files) ? body.files : [];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  return NextResponse.json(analyzeUploads(files));
}
