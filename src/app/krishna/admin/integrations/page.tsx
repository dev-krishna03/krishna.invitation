import { prisma } from "@/lib/prisma";

export default async function AdminIntegrationsPage() {
  const integrations = await prisma.integrationCredential.findMany({ orderBy: { service_slug: "asc" } });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {integrations.map((i) => (
          <div key={i.id} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{i.display_name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${i.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                {i.is_configured ? (i.is_active ? "Active" : "Configured") : "Not set up"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{i.service_slug}</p>
            {i.last_tested_at && (
              <p className="mt-2 text-xs">
                Tested: {i.last_tested_at.toISOString()} ({i.test_status ?? "—"})
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
