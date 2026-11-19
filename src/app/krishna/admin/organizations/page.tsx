import { prisma } from "@/lib/prisma";

export default async function AdminOrgsPage() {
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { members: true, invitations: true } }, subscriptions: { include: { plan: true } } },
    orderBy: { created_at: "desc" },
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Name</th>
            <th>Members</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="py-2">{o.name}</td>
              <td>{o._count.members}</td>
              <td>{o.subscriptions[0]?.plan.name ?? "—"}</td>
              <td>{o.subscription_status}</td>
              <td>{o.created_at.toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
