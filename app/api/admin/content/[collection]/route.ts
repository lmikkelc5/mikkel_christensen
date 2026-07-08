import { NextResponse } from "next/server";

import { listEntries, writeEntry } from "@/lib/admin-content";
import { requireAdminApi } from "@/lib/auth";
import type { CollectionName } from "@/lib/content";

type Params = { params: Promise<{ collection: string }> };

function toCollectionName(value: string): CollectionName | null {
  if (value === "articles" || value === "recipes" || value === "projects") return value;
  return null;
}

export async function GET(_: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { collection: rawCollection } = await params;
  const collection = toCollectionName(rawCollection);
  if (!collection) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }
  return NextResponse.json(listEntries(collection));
}

export async function POST(request: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { collection: rawCollection } = await params;
  const collection = toCollectionName(rawCollection);
  if (!collection) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }
  const body = await request.json();
  const slug = writeEntry(collection, body);
  return NextResponse.json({ ok: true, slug });
}
