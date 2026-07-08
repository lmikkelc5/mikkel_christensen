import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/admin-content";

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const scope = String(formData.get("scope") || "");
  const file = formData.get("file");

  if (!(file instanceof File) || !scope) {
    return NextResponse.json({ error: "Missing upload data" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = saveUploadedFile(scope, file.name, buffer);
  return NextResponse.json({ ok: true, url });
}
