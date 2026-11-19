import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "krishna_admin";
export const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE ?? "123456";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string {
  return process.env.CREDENTIALS_ENCRYPTION_KEY ?? "dev-only-fallback-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function mintAdminToken(): string {
  const payload = `admin.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [kind, expStr, sig] = parts;
  if (kind !== "admin") return false;
  const payload = `${kind}.${expStr}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return true;
}

export async function hasAdminCookie(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function hasAdminCookieFromRequest(value: string | undefined): boolean {
  return verifyAdminToken(value);
}
