import { NextResponse } from "next/server";

import { deleteEntry, readEntry, writeEntry } from "@/lib/admin-content";
import { requireAdminApi } from "@/lib/auth";
import type { CollectionName } from "@/lib/content";

type Params = { params: Promise<{ collection: string; slug: string }> };

function toCollectionName(value: string): CollectionName | null {
  if (value === "articles" || value === "recipes" || value === "projects") return value;
  return null;
}

export async function GET(_: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { collection: rawCollection, slug } = await params;
  const collection = toCollectionName(rawCollection);
  if (!collection) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }
  return NextResponse.json(readEntry(collection, slug));
}

export async function PUT(request: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { collection: rawCollection, slug } = await params;
  const collection = toCollectionName(rawCollection);
  if (!collection) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }
  const body = await request.json();
  const nextSlug = writeEntry(collection, body, slug);
  return NextResponse.json({ ok: true, slug: nextSlug });
}

export async function DELETE(_: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { collection: rawCollection, slug } = await params;
  const collection = toCollectionName(rawCollection);
  if (!collection) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }
  deleteEntry(collection, slug);
  return NextResponse.json({ ok: true });
}
