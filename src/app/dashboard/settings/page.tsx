import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AccountSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold">Account</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Name" value={dbUser?.name ?? "—"} />
        <Row label="Email" value={dbUser?.email ?? user.email ?? "—"} />
        <Row label="Referral code" value={dbUser?.referral_code ?? "—"} />
        <Row label="Credits" value={String(dbUser?.referral_credit ?? 0)} />
        <Row label="Preferred language" value={dbUser?.locale ?? "en"} />
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
