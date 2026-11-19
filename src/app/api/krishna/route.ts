import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_ACCESS_CODE, ADMIN_COOKIE, mintAdminToken } from "@/lib/admin-access";

const Body = z.object({ code: z.string().min(1).max(32) });

// Tiny per-IP throttle to blunt brute force. The shared /api/* middleware
// already rate-limits auth routes, but this endpoint deserves its own lockout.
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 10;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const now = Date.now();
  const bucket = attempts.get(ip);
  if (bucket && bucket.until > now && bucket.count >= MAX) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.code !== ADMIN_ACCESS_CODE) {
    const entry = bucket && bucket.until > now ? bucket : { count: 0, until: now + WINDOW_MS };
    entry.count += 1;
    attempts.set(ip, entry);
    return NextResponse.json({ error: "Incorrect code" }, { status: 401 });
  }

  attempts.delete(ip);
  const token = mintAdminToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return NextResponse.json({ ok: true, next: "/krishna/admin" });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
