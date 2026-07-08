import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin-session";
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "changeme";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "local-dev-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || DEFAULT_USERNAME,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
  };
}

export function createSessionToken(username: string) {
  const payload = `${username}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [username, issuedAt, signature] = token.split(/[:.]/);
  if (!username || !issuedAt || !signature) {
    return false;
  }

  const payload = `${username}:${issuedAt}`;
  return sign(payload) === signature;
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function requireAdminApi() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export const adminCookieName = COOKIE_NAME;
