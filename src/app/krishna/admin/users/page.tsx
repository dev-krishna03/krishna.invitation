import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { invitations: true } } },
    orderBy: { created_at: "desc" },
    take: 100,
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Users</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Invitations</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.name ?? "—"}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u._count.invitations}</td>
              <td>{u.created_at.toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
