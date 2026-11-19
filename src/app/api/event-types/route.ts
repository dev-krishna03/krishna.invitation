import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const eventTypes = await prisma.eventTypeConfig.findMany({
    where: { is_active: true },
    orderBy: [{ is_featured: "desc" }, { sort_order: "asc" }],
  });
  return NextResponse.json({ eventTypes });
}
