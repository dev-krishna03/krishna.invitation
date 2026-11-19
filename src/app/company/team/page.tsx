import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanyTeam() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");
  const members = await prisma.orgMember.findMany({
    where: { org_id: member.org_id },
    include: { user: { select: { name: true, email: true } } },
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Team</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="py-2">{m.user.name ?? "—"}</td>
              <td>{m.user.email}</td>
              <td>{m.role}</td>
              <td>{m.joined_at?.toISOString().slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-sm text-gray-500">
        Invite via <code className="mx-1 rounded bg-gray-100 px-1">POST /api/org/members</code>.
      </p>
    </main>
  );
}
