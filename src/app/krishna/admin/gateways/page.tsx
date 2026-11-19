import { prisma } from "@/lib/prisma";

export default async function AdminGatewaysPage() {
  const gateways = await prisma.paymentGateway.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Payment Gateways</h1>
      <p className="mt-1 text-sm text-gray-600">Only one may be active at a time.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {gateways.map((g) => (
          <div key={g.id} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{g.display_name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${g.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                {g.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-xs">Environment: {g.environment}</p>
            <p className="mt-1 text-xs text-gray-500">
              Fields: {Object.keys((g.credentials as object) ?? {}).join(", ") || "none configured"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
