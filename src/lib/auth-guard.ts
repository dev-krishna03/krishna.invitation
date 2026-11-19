import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@prisma/client";
import { hasAdminCookie } from "@/lib/admin-access";

export async function requireUser(): Promise<User | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });
  return dbUser;
}

export async function requireRole(role: UserRole): Promise<User | NextResponse> {
  const r = await requireUser();
  if (r instanceof NextResponse) return r;
  if (r.role !== role)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return r;
}

export async function requireSuperAdmin(): Promise<User | NextResponse> {
  // The hidden /krishna code gate also authorises super-admin writes, in
  // addition to Supabase users with role=SUPER_ADMIN. The seeded super-admin
  // row (email admin@invites.local) is used as the actor on audit logs when
  // the code gate is what granted access.
  if (await hasAdminCookie()) {
    const seeded = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    if (seeded) return seeded;
  }
  return requireRole("SUPER_ADMIN" as UserRole);
}
