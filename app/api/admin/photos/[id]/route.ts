import { NextResponse } from "next/server";

import { deletePhoto, updatePhoto } from "@/lib/admin-photos";
import { requireAdminApi } from "@/lib/auth";
import { getPhotoById } from "@/lib/photos";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const photo = getPhotoById(id);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(photo);
}

export async function PUT(request: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const updated = updatePhoto(id, {
    title: body.title as string | undefined,
    description: body.description as string | undefined,
    trip: body.trip as string | undefined,
    film: body.film as string | undefined,
    camera: body.camera as string | undefined,
    lens: body.lens as string | undefined,
    dateTaken: body.dateTaken as string | undefined,
    location: body.location as string | undefined,
    iso: body.iso as string | undefined,
    aperture: body.aperture as string | undefined,
    shutterSpeed: body.shutterSpeed as string | undefined,
    focalLength: body.focalLength as string | undefined,
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
    featured: typeof body.featured === "boolean" ? body.featured : undefined,
    favorite: typeof body.favorite === "boolean" ? body.favorite : undefined
  });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, photo: updated });
}

export async function DELETE(_: Request, { params }: Params) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const deleted = deletePhoto(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
