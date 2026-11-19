import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanyInvitations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");
  const invitations = await prisma.invitation.findMany({
    where: { org_id: member.org_id },
    include: { template: true, user: { select: { name: true, email: true } }, _count: { select: { views: true } } },
    orderBy: { created_at: "desc" },
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Invitations</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Title</th>
            <th>Created by</th>
            <th>Template</th>
            <th>Status</th>
            <th>Views</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.title}</td>
              <td>{i.user.name ?? i.user.email}</td>
              <td>{i.template.name}</td>
              <td>{i.is_published ? "Published" : "Draft"}</td>
              <td>{i._count.views}</td>
              <td>{i.created_at.toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
