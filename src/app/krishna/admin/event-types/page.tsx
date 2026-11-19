import { prisma } from "@/lib/prisma";
import { EventTypesManager } from "./EventTypesManager";

export default async function AdminEventTypesPage() {
  const rows = await prisma.eventTypeConfig.findMany({ orderBy: { sort_order: "asc" } });
  const items = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    parent_id: r.parent_id,
    is_active: r.is_active,
    is_featured: r.is_featured,
    sort_order: r.sort_order,
  }));
  return (
    <main className="p-8">
      <EventTypesManager initial={items} />
    </main>
  );
}
