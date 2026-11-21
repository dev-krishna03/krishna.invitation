import { prisma } from "@/lib/prisma";
import { PoliciesAdmin } from "./PoliciesAdmin";

export default async function AdminPoliciesPage() {
  const policies = await prisma.policy.findMany({ orderBy: { title: "asc" } });
  return (
    <main className="p-8">
      <div>
        <h1 className="text-2xl font-semibold">Policies</h1>
        <p className="mt-1 text-sm text-stone-600">
          Edit the public policies at <code className="rounded bg-stone-100 px-1">/policies/[slug]</code>. Version is a label — bump it when the content materially changes.
        </p>
      </div>
      <div className="mt-6">
        <PoliciesAdmin
          policies={policies.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            summary: p.summary,
            content: p.content,
            version: p.version,
            is_published: p.is_published,
          }))}
        />
      </div>
    </main>
  );
}
