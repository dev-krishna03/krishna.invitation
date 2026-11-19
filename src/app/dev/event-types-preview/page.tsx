import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventTypesManager } from "@/app/krishna/admin/event-types/EventTypesManager";

// Dev-only preview of the Super Admin occasions manager — lets you see the UI
// without a Supabase session. Writes still go through /api/admin/event-types,
// which returns 401 outside a signed-in super-admin session.
export default async function Preview() {
  if (process.env.NODE_ENV === "production") notFound();
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
      <div className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
        Dev preview — the real page is <code>/krishna/admin/event-types</code> (sign-in required). Writes here
        still require a super-admin session.
      </div>
      <EventTypesManager initial={items} />
    </main>
  );
}
