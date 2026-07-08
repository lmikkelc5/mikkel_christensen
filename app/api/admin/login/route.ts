import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { adminCookieName, createSessionToken, getAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const expected = getAdminCredentials();
  if (username !== expected.username || password !== expected.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
