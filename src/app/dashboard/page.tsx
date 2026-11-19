import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MyInvitationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const invitations = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { template: true, _count: { select: { guests: true, views: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Invitations</h1>
        <Link href="/dashboard/create" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Create New
        </Link>
      </div>

      {invitations.length === 0 ? (
        <p className="mt-10 text-gray-500">No invitations yet. Create your first one.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((i) => (
            <Link key={i.id} href={`/dashboard/invitations/${i.id}`} className="rounded-xl border p-4 hover:shadow-sm">
              <p className="text-xs uppercase text-gray-500">{i.event_type}</p>
              <h3 className="mt-1 font-semibold">{i.title}</h3>
              <p className="mt-2 text-xs text-gray-500">{i.template.name}</p>
              <div className="mt-3 flex gap-3 text-xs text-gray-600">
                <span>{i._count.views} views</span>
                <span>{i._count.guests} guests</span>
                <span>{i.is_published ? "Published" : "Draft"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
