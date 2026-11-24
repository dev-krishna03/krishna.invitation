import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPlatformFeeConfig, computeTemplateSplit } from "@/lib/pricing-calculator";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase().trim()),
  amount: z.number().int().positive(),
  templateId: z.string().uuid().optional(),
  userEmail: z.string().email().optional(),
});

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { code, amount, templateId } = parsed.data;

  // Attempt to resolve user from auth session or request
  let userEmail = parsed.data.userEmail;
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      if (!userEmail && user.email) userEmail = user.email;
    }
  } catch {
    // optional auth
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: {
      template: { select: { id: true, name: true, owner_user_id: true, category: true, source: true } },
    },
  });

  if (!coupon || !coupon.is_active) {
    return NextResponse.json({ valid: false, reason: "Invalid or inactive coupon code" });
  }

  const now = new Date();

  // 1. Scheduled Date Window (valid_from & valid_until)
  if (coupon.valid_from && coupon.valid_from > now) {
    return NextResponse.json({
      valid: false,
      reason: `This promotion is scheduled to start on ${coupon.valid_from.toLocaleDateString()}`,
    });
  }
  if (coupon.valid_until && coupon.valid_until < now) {
    return NextResponse.json({
      valid: false,
      reason: `This coupon expired on ${coupon.valid_until.toLocaleDateString()}`,
    });
  }

  // 2. Day-wise validation (allowed_days_of_week)
  if (coupon.allowed_days_of_week && coupon.allowed_days_of_week.length > 0) {
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!coupon.allowed_days_of_week.includes(currentDay)) {
      const allowedNames = coupon.allowed_days_of_week.map((d) => DAY_NAMES[d]).join(", ");
      return NextResponse.json({
        valid: false,
        reason: `This coupon is only valid on: ${allowedNames}. (Today is ${DAY_NAMES[currentDay]})`,
      });
    }
  }

  // 3. Time-of-day window (time_start & time_end)
  if (coupon.time_start && coupon.time_end) {
    const currentHourMin = now.toTimeString().slice(0, 5); // "HH:MM"
    if (currentHourMin < coupon.time_start || currentHourMin > coupon.time_end) {
      return NextResponse.json({
        valid: false,
        reason: `This promotion is active only between ${coupon.time_start} and ${coupon.time_end}`,
      });
    }
  }

  // 4. Number-of-users wise limit (max_uses)
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({
      valid: false,
      reason: `Coupon redemption limit reached. This offer was limited to the first ${coupon.max_uses} users.`,
    });
  }

  // 5. Minimum order spend
  if (coupon.min_amount && amount < coupon.min_amount) {
    return NextResponse.json({
      valid: false,
      reason: `Minimum order amount of ₹${coupon.min_amount.toLocaleString()} required for this coupon`,
    });
  }

  // 6. User-wise targeting: allowed user emails
  if (coupon.allowed_user_emails && coupon.allowed_user_emails.length > 0) {
    if (!userEmail) {
      return NextResponse.json({
        valid: false,
        reason: "Please log in to use this exclusive private coupon.",
      });
    }
    const emailLower = userEmail.toLowerCase().trim();
    const isAllowed = coupon.allowed_user_emails.some((e) => e.toLowerCase().trim() === emailLower);
    if (!isAllowed) {
      return NextResponse.json({
        valid: false,
        reason: "This coupon is restricted to invited recipients.",
      });
    }
  }

  // 7. User-wise: First-time buyers only
  if (coupon.first_time_only && userId) {
    const priorPurchases = await prisma.payment.count({
      where: { user_id: userId, status: "SUCCESS" },
    });
    if (priorPurchases > 0) {
      return NextResponse.json({
        valid: false,
        reason: "This special welcome discount is valid for first-time buyers only.",
      });
    }
  }

  // 8. User-wise: Per-user usage limit
  if (coupon.max_uses_per_user && userId) {
    const userRedemptions = await prisma.payment.count({
      where: { user_id: userId, coupon_id: coupon.id, status: "SUCCESS" },
    });
    if (userRedemptions >= coupon.max_uses_per_user) {
      return NextResponse.json({
        valid: false,
        reason: `You have already used this coupon the maximum allowed limit of ${coupon.max_uses_per_user} time(s).`,
      });
    }
  }

  // 9. Scope & Ownership validation
  if (templateId) {
    const targetTemplate = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true, name: true, owner_user_id: true, category: true, source: true },
    });

    if (targetTemplate) {
      // If creator coupon, must belong to this creator
      if (coupon.creator_user_id && targetTemplate.owner_user_id !== coupon.creator_user_id) {
        return NextResponse.json({
          valid: false,
          reason: "This discount is created by a designer and applies only to their templates.",
        });
      }

      // If specific template restricted
      if (coupon.template_id && coupon.template_id !== targetTemplate.id) {
        return NextResponse.json({
          valid: false,
          reason: "This coupon is only valid for a specific designated template.",
        });
      }

      // If scope is ADMIN_TEMPLATES only:
      if (coupon.scope === "ADMIN_TEMPLATES" && targetTemplate.owner_user_id !== null) {
        return NextResponse.json({
          valid: false,
          reason: "This promotion applies to official Balcony templates only.",
        });
      }

      // If scope is CREATOR_TEMPLATES only:
      if (coupon.scope === "CREATOR_TEMPLATES" && targetTemplate.owner_user_id === null) {
        return NextResponse.json({
          valid: false,
          reason: "This coupon is valid only on community creator templates.",
        });
      }

      // Category filter check
      if (coupon.category_filter && targetTemplate.category !== coupon.category_filter) {
        return NextResponse.json({
          valid: false,
          reason: `This coupon applies only to ${coupon.category_filter} invitations.`,
        });
      }
    }
  }

  // Calculate discount with optional maximum cap
  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((amount * coupon.value) / 100)
      : Math.min(amount, coupon.value);

  // Apply max discount amount cap if specified (e.g. 50% off up to ₹250)
  if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
    discount = coupon.max_discount_amount;
  }

  // Retrieve platform fee configuration set by Super Admin
  const feeConfig = await getPlatformFeeConfig();
  const split = computeTemplateSplit({
    basePrice: amount,
    discountAmount: discount,
    feePercentage: feeConfig.fee_percentage,
    calculateOnBasePrice: feeConfig.calculate_on_base_price,
  });

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    name: coupon.name || coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    finalAmount: split.hostPayAmount,
    maxDiscountCap: coupon.max_discount_amount || null,
    rules: {
      scope: coupon.scope,
      daysOfWeek: coupon.allowed_days_of_week,
      firstTimeOnly: coupon.first_time_only,
      maxUsesPerUser: coupon.max_uses_per_user,
    },
    splitBreakdown: {
      basePrice: split.basePrice,
      discount: split.discountAmount,
      hostPays: split.hostPayAmount,
      platformFee: split.platformFee,
      feePercentage: split.feePercentage,
      creatorReceives: split.creatorReceives,
      calculationRule: split.calculateOnBasePrice
        ? "10% Platform fee on base price (creator absorbs discount)"
        : "Platform fee on net price",
    },
  });
}
