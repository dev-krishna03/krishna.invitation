import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const version = await prisma.activityHistory.findUnique({
    where: { id },
  });

  if (!version || !version.snapshot) {
    return NextResponse.json({ error: "Version or snapshot not found" }, { status: 404 });
  }

  // Restore snapshot depending on entity type
  const snap = version.snapshot as Record<string, any>;

  if (version.entity_type === "INVITATION") {
    await prisma.invitation.update({
      where: { id: version.entity_id },
      data: {
        ...(snap.title ? { title: snap.title } : {}),
        ...(snap.event_date ? { event_date: new Date(snap.event_date) } : {}),
      },
    });
  } else if (version.entity_type === "TEMPLATE") {
    await prisma.template.update({
      where: { id: version.entity_id },
      data: {
        ...(snap.name ? { name: snap.name } : {}),
        ...(snap.description ? { description: snap.description } : {}),
        ...(snap.price !== undefined ? { price: snap.price } : {}),
      },
    });
  }

  // Record restoration in activity history
  await prisma.activityHistory.create({
    data: {
      entity_type: version.entity_type,
      entity_id: version.entity_id,
      user_id: user.id,
      action: "RESTORE_VERSION",
      title: `Restored to Version ${version.version_num}`,
      description: `Reverted state to version saved on ${new Date(version.created_at).toLocaleString()}`,
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Restored to Version ${version.version_num} successfully.`,
    snapshot: snap,
  });
}
