import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InvitationManage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      template: true,
      _count: { select: { guests: true, views: true } },
      guests: { orderBy: { name: "asc" } },
    },
  });
  if (!invitation || invitation.user_id !== user.id) notFound();

  const rsvp = {
    ACCEPTED: invitation.guests.filter((g) => g.rsvp_status === "ACCEPTED").length,
    DECLINED: invitation.guests.filter((g) => g.rsvp_status === "DECLINED").length,
    MAYBE: invitation.guests.filter((g) => g.rsvp_status === "MAYBE").length,
    PENDING: invitation.guests.filter((g) => g.rsvp_status === "PENDING").length,
  };

  const publicUrl = `/invite/${invitation.slug}`;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{invitation.title}</h1>
      <div className="mt-2 text-sm text-gray-500">
        {invitation.event_type} · {invitation.template.name} ·{" "}
        {invitation.is_published ? "Published" : "Draft"}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Views" value={invitation._count.views} />
        <Stat label="Guests" value={invitation._count.guests} />
        <Stat label="Accepted" value={rsvp.ACCEPTED} />
        <Stat label="Declined" value={rsvp.DECLINED} />
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">Share</h2>
        <p className="mt-2 text-sm">
          Public link:{" "}
          <Link href={publicUrl} className="underline">
            {publicUrl}
          </Link>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Guests</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-gray-500">
              <th className="py-2">Name</th>
              <th>Personal Link</th>
              <th>Viewed</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>
            {invitation.guests.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="py-2">{g.name}</td>
                <td className="font-mono text-xs">
                  /invite/{invitation.slug}/{g.slug}
                </td>
                <td>{g.viewed_at ? "Yes" : "No"}</td>
                <td>{g.rsvp_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
