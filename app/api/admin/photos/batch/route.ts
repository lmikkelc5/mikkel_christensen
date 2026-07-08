import { NextResponse } from "next/server";

import { batchUpdatePhotos } from "@/lib/admin-photos";
import { requireAdminApi } from "@/lib/auth";
import type { PhotoRecord } from "@/lib/photo-types";

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const body = (await request.json()) as {
    ids: string[];
    updates: Partial<PhotoRecord>;
  };

  if (!body.ids?.length) {
    return NextResponse.json({ error: "No photo ids provided" }, { status: 400 });
  }

  const updated = batchUpdatePhotos(body.ids, body.updates ?? {});
  return NextResponse.json({ ok: true, updated });
}
