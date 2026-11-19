import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanySubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");
  const sub = await prisma.subscription.findFirst({
    where: { org_id: member.org_id, status: "ACTIVE" },
    include: { plan: true },
    orderBy: { current_period_end: "desc" },
  });
  const [inv, mem] = await Promise.all([
    prisma.invitation.count({ where: { org_id: member.org_id } }),
    prisma.orgMember.count({ where: { org_id: member.org_id } }),
  ]);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Subscription</h1>
      {!sub ? (
        <p className="mt-6 text-sm">No active subscription.</p>
      ) : (
        <div className="mt-6 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">{sub.plan.name}</h2>
          <p className="text-sm text-gray-500">
            {sub.plan.billing_period} · ₹{sub.plan.price.toLocaleString()}
          </p>
          <p className="mt-2 text-sm">
            Renews: {sub.current_period_end.toISOString().slice(0, 10)}
          </p>
          <p className="mt-4 text-sm">
            Invitations used: {inv} / {sub.plan.max_invitations ?? "∞"}
          </p>
          <p className="text-sm">
            Members used: {mem} / {sub.plan.max_members ?? "∞"}
          </p>
        </div>
      )}
    </main>
  );
}
