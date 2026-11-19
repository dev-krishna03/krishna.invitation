import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrgAdmin } from "@/lib/company-guard";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { OrgMemberRole } from "@prisma/client";

const Invite = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgMemberRole).default("MEMBER"),
});

export async function GET() {
  const got = await requireOrgAdmin();
  if (got instanceof NextResponse) return got;
  const members = await prisma.orgMember.findMany({
    where: { org_id: got.org.id },
    include: { user: { select: { email: true, name: true, _count: { select: { invitations: true } } } } },
    orderBy: { joined_at: "desc" },
  });
  return NextResponse.json({ members });
}

export async function POST(req: Request) {
  const got = await requireOrgAdmin();
  if (got instanceof NextResponse) return got;
  const parsed = Invite.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const plan = await prisma.subscription.findFirst({
    where: { org_id: got.org.id, status: "ACTIVE" },
    include: { plan: true },
  });
  const count = await prisma.orgMember.count({ where: { org_id: got.org.id } });
  if (plan?.plan.max_members && count >= plan.plan.max_members)
    return NextResponse.json({ error: "Member limit reached" }, { status: 400 });

  const invitedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!invitedUser) return NextResponse.json({ error: "User must sign up first" }, { status: 400 });

  const member = await prisma.orgMember.upsert({
    where: { org_id_user_id: { org_id: got.org.id, user_id: invitedUser.id } },
    create: { org_id: got.org.id, user_id: invitedUser.id, role: parsed.data.role, invited_at: new Date(), joined_at: new Date() },
    update: { role: parsed.data.role },
  });

  await sendEmail({ to: parsed.data.email, templateId: "TEAM_INVITE", params: { org: got.org.name } });
  const actorId = "id" in got.user ? got.user.id : null;
  await logAudit({ actorId, action: "org.member.invite", entityType: "OrgMember", entityId: member.id, newValue: member });
  return NextResponse.json({ member });
}
