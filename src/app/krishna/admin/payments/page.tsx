import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { created_at: "desc" },
    take: 200,
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Date</th>
            <th>User</th>
            <th>Gateway</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.created_at.toISOString().slice(0, 10)}</td>
              <td>{p.user.email}</td>
              <td>{p.gateway}</td>
              <td>₹{p.amount.toLocaleString()}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
