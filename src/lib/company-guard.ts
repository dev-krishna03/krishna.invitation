import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import type { OrgMember, Organization, User } from "@prisma/client";

export async function requireOrgMember(): Promise<
  | { user: User; org: Organization; member: OrgMember }
  | NextResponse
> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const member = await prisma.orgMember.findFirst({
    where: { user_id: user.id },
    orderBy: { joined_at: "desc" },
  });
  if (!member) return NextResponse.json({ error: "No organization" }, { status: 403 });
  const org = await prisma.organization.findUnique({ where: { id: member.org_id } });
  if (!org || !org.is_active)
    return NextResponse.json({ error: "Organization inactive" }, { status: 403 });
  return { user, org, member };
}

export async function requireOrgAdmin() {
  const got = await requireOrgMember();
  if (got instanceof NextResponse) return got;
  if (got.member.role === "MEMBER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return got;
}
