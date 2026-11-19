import { prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { email: true } } },
    orderBy: { created_at: "desc" },
    take: 200,
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b">
              <td className="py-2">{l.created_at.toISOString()}</td>
              <td>{l.actor?.email ?? "—"}</td>
              <td className="font-mono">{l.action}</td>
              <td>{l.entity_type}#{l.entity_id?.slice(0, 8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
