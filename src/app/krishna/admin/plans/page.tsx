import { prisma } from "@/lib/prisma";

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sort_order: "asc" } });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Subscription Plans</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border p-5">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.type} · {p.billing_period}</p>
            <p className="mt-2 text-2xl">₹{p.price.toLocaleString()}</p>
            <p className="mt-2 text-xs">
              Members: {p.max_members ?? "∞"} · Invitations: {p.max_invitations ?? "∞"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
