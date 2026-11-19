import { prisma } from "@/lib/prisma";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { created_at: "desc" } });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Coupons</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-gray-500">
            <th className="py-2">Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used / Max</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2 font-mono">{c.code}</td>
              <td>{c.type}</td>
              <td>{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}</td>
              <td>{c.used_count} / {c.max_uses ?? "∞"}</td>
              <td>{c.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
