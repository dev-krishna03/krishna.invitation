import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invitations = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { _count: { select: { views: true, guests: true } } },
  });
  const totalViews = invitations.reduce((s, i) => s + i._count.views, 0);
  const totalGuests = invitations.reduce((s, i) => s + i._count.guests, 0);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-gray-500">Invitations</p>
          <p className="mt-2 text-3xl">{invitations.length}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-gray-500">Total Views</p>
          <p className="mt-2 text-3xl">{totalViews}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs uppercase text-gray-500">Total Guests</p>
          <p className="mt-2 text-3xl">{totalGuests}</p>
        </div>
      </div>
    </main>
  );
}
