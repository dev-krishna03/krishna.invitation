import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanySettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");
  const org = await prisma.organization.findUnique({ where: { id: member.org_id } });

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold">Organization Settings</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Name" value={org?.name ?? "—"} />
        <Row label="Slug" value={org?.slug ?? "—"} />
        <Row label="Subscription Status" value={org?.subscription_status ?? "—"} />
      </dl>
    </main>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <dt className="text-gray-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
