import { prisma } from "@/lib/prisma";
import { ElementsAdmin } from "./ElementsAdmin";

export default async function AdminElementsPage() {
  const elements = await prisma.templateElement.findMany({ orderBy: [{ category: "asc" }, { sort_order: "asc" }] });
  return (
    <main className="p-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Editor Elements</h1>
        <p className="mt-1 text-sm text-stone-600">
          The palette that users see inside the invitation editor. Add new blocks, group them by category, mark pro-only, or toggle off anything you don&apos;t want shipped.
        </p>
      </div>
      <div className="mt-6">
        <ElementsAdmin
          initial={elements.map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.name,
            kind: e.kind,
            category: e.category,
            icon: e.icon,
            description: e.description,
            default_props: e.default_props as Record<string, unknown>,
            is_pro_only: e.is_pro_only,
            is_active: e.is_active,
            sort_order: e.sort_order,
          }))}
        />
      </div>
    </main>
  );
}
