import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { adminCookieName } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
  return NextResponse.json({ ok: true });
}
