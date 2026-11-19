import { prisma } from "@/lib/prisma";

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({
    include: { pricing: true, _count: { select: { invitations: true } } },
    orderBy: { sort_order: "asc" },
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Name</th>
            <th>Category</th>
            <th>Events</th>
            <th>Active</th>
            <th>Featured</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2">{t.name}</td>
              <td>{t.category}</td>
              <td>{t.event_types.join(", ")}</td>
              <td>{t.is_active ? "Yes" : "No"}</td>
              <td>{t.is_featured ? "Yes" : "No"}</td>
              <td>{t._count.invitations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
