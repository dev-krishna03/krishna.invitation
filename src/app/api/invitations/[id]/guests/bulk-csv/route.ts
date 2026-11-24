import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";

const GuestRowSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  plus_ones: z.number().int().min(0).max(10).default(0),
  dietary_preference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const BulkBodySchema = z.object({
  guests: z.array(GuestRowSchema).min(1, "At least one guest row is required"),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id: invitationId } = await ctx.params;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.user_id !== user.id) {
    return NextResponse.json({ error: "Invitation not found or unauthorized" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = BulkBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid guest CSV data", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const rawRows = parsed.data.guests;
  const createdGuests: any[] = [];
  const errors: { row: number; name: string; error: string }[] = [];

  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    try {
      const baseSlug = slugify(row.name);
      const guestSlug = `${baseSlug}-${uniqueSuffix()}`;

      // Clean phone number (Indian standard format if 10 digits)
      let cleanedPhone = row.phone ? row.phone.replace(/[^\d+]/g, "") : null;
      if (cleanedPhone && cleanedPhone.length === 10 && !cleanedPhone.startsWith("+")) {
        cleanedPhone = `+91${cleanedPhone}`;
      }

      const created = await prisma.guest.create({
        data: {
          invitation_id: invitationId,
          name: row.name.trim(),
          slug: guestSlug,
          phone: cleanedPhone,
          email: row.email || null,
          plus_allowed: row.plus_ones || 0,
          plus_count: row.plus_ones || 0,
          dietary_notes: row.dietary_preference || null,
          meal_preference: row.dietary_preference || null,
          rsvp_message: row.notes || null,
        },
      });
      createdGuests.push(created);
    } catch (e) {
      errors.push({
        row: idx + 1,
        name: row.name,
        error: e instanceof Error ? e.message : "Failed to create guest",
      });
    }
  }

  // Record in Activity History
  await prisma.activityHistory.create({
    data: {
      entity_type: "INVITATION",
      entity_id: invitationId,
      user_id: user.id,
      action: "IMPORT_CSV_GUESTS",
      title: `Bulk Imported ${createdGuests.length} Guests via CSV`,
      description: `Added ${createdGuests.length} guest records with personal RSVP links. Errors: ${errors.length}.`,
    },
  });

  return NextResponse.json({
    ok: true,
    importedCount: createdGuests.length,
    failedCount: errors.length,
    errors,
    message: `Successfully imported ${createdGuests.length} guests via CSV.`,
  });
}
