import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CompanyDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");

  const [inv, published, views, memberCount] = await Promise.all([
    prisma.invitation.count({ where: { org_id: member.org_id } }),
    prisma.invitation.count({ where: { org_id: member.org_id, is_published: true } }),
    prisma.invitationView.count({ where: { invitation: { org_id: member.org_id } } }),
    prisma.orgMember.count({ where: { org_id: member.org_id } }),
  ]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Company Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card label="Total Invitations" value={inv} />
        <Card label="Published" value={published} />
        <Card label="Total Views" value={views} />
        <Card label="Team Members" value={memberCount} />
      </div>
    </main>
  );
}
function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
