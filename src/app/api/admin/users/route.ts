import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const take = 25;
  const where = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] }
    : undefined;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { invitations: true } } },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ users, total, page, pageSize: take });
}
