import { NextResponse } from "next/server";

import { importPhotos, listAdminPhotos, type UploadDecision } from "@/lib/admin-photos";
import { requireAdminApi } from "@/lib/auth";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  return NextResponse.json(listAdminPhotos());
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  const rawDecisions = formData.getAll("decisions").map((value) => String(value));

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const entries = files.map((file, index) => {
    let decision: UploadDecision = { action: "import" };
    try {
      if (rawDecisions[index]) {
        decision = JSON.parse(rawDecisions[index]) as UploadDecision;
      }
    } catch {
      decision = { action: "import" };
    }
    return { file, decision };
  });

  const result = await importPhotos(entries);

  if (!result.created.length && !result.replaced.length) {
    return NextResponse.json(
      {
        error: "No supported image files were uploaded",
        skipped: result.skipped
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
