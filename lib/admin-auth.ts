// Stateless admin sessions for /admin. Requires ADMIN_PASSWORD; the session
// cookie is an HMAC over its own expiry, so no server-side session store is
// needed and rotating the password invalidates every existing session.

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "aura_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function isAdminConfigured(): boolean {
  return Boolean(adminPassword());
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function signExpiry(expiresAt: number, password: string): string {
  return createHmac("sha256", password)
    .update(`aura-admin-session:${expiresAt}`)
    .digest("hex");
}

export function verifyAdminPassword(supplied: string): boolean {
  const password = adminPassword();
  return Boolean(password) && safeEqual(supplied, password as string);
}

export function createAdminSessionToken(): string {
  const password = adminPassword();
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set.");
  }
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  return `${expiresAt}.${signExpiry(expiresAt, password)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const password = adminPassword();
  if (!password || !token) return false;

  const [expiryPart, signature] = token.split(".");
  const expiresAt = Number(expiryPart);
  if (!signature || !Number.isFinite(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  return safeEqual(signature, signExpiry(expiresAt, password));
}

/** Reads the session cookie of the current request (route handlers/pages). */
export function isAdminSession(): boolean {
  return verifyAdminSessionToken(
    cookies().get(ADMIN_SESSION_COOKIE)?.value,
  );
}
