import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const elements = await prisma.templateElement.findMany({
    where: { is_active: true },
    orderBy: [{ category: "asc" }, { sort_order: "asc" }],
  });
  return NextResponse.json({ elements });
}
