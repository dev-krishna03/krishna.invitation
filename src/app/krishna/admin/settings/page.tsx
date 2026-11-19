import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Site Settings</h1>
      <div className="mt-6 space-y-3">
        {settings.map((s) => (
          <div key={s.id} className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{s.key}</p>
            <pre className="mt-2 overflow-x-auto text-sm">{JSON.stringify(s.value, null, 2)}</pre>
          </div>
        ))}
      </div>
    </main>
  );
}
