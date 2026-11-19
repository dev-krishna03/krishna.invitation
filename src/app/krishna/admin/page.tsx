import { prisma } from "@/lib/prisma";

async function stats() {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [users, activeInv, revThisMonth, companies] = await Promise.all([
    prisma.user.count(),
    prisma.invitation.count({ where: { is_published: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", created_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.organization.count({ where: { subscription_status: "ACTIVE" } }),
  ]);
  return {
    users,
    activeInv,
    revenue: revThisMonth._sum.amount ?? 0,
    companies,
  };
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const s = await stats();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total Users" value={s.users} />
        <Card label="Active Invitations" value={s.activeInv} />
        <Card label="Revenue (this month)" value={`₹${s.revenue.toLocaleString()}`} />
        <Card label="Active Companies" value={s.companies} />
      </div>
      <p className="mt-10 text-sm text-gray-600">
        Charts (revenue 12 months, signups 30 days) wire to real queries — see
        <code className="mx-1 rounded bg-gray-100 px-1">GET /api/admin/analytics</code>.
      </p>
    </main>
  );
}
