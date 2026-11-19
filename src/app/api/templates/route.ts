import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.template.findMany({
    where: { is_active: true },
    include: { pricing: { where: { is_active: true }, orderBy: { duration_days: "asc" } } },
    orderBy: [{ is_featured: "desc" }, { sort_order: "asc" }],
  });
  return NextResponse.json({ templates });
}
