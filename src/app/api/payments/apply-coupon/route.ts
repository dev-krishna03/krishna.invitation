import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Body = z.object({ code: z.string().min(1), amount: z.number().int().positive() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { code, amount } = parsed.data;
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.is_active) return NextResponse.json({ valid: false, reason: "Invalid code" });
  const now = new Date();
  if ((coupon.valid_from && coupon.valid_from > now) || (coupon.valid_until && coupon.valid_until < now))
    return NextResponse.json({ valid: false, reason: "Expired" });
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
    return NextResponse.json({ valid: false, reason: "Out of uses" });
  if (coupon.min_amount && amount < coupon.min_amount)
    return NextResponse.json({ valid: false, reason: "Minimum amount not met" });
  const discount = coupon.type === "PERCENTAGE" ? Math.round((amount * coupon.value) / 100) : coupon.value;
  return NextResponse.json({ valid: true, discount });
}
