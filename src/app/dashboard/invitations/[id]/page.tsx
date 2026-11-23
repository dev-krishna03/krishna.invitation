import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { InvitationCommandCenter } from "@/components/invitation-manage/InvitationCommandCenter";

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

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const serializedInvitation = {
    id: invitation.id,
    title: invitation.title,
    slug: invitation.slug,
    event_type: invitation.event_type,
    is_published: invitation.is_published,
    published_at: invitation.published_at?.toISOString() || null,
    expires_at: invitation.expires_at?.toISOString() || null,
    view_count: invitation.view_count,
    data: (invitation.data as Record<string, any>) || {},
    music_url: invitation.music_url,
    template: {
      id: invitation.template.id,
      name: invitation.template.name,
      slug: invitation.template.slug,
      thumbnail_url: invitation.template.thumbnail_url,
    },
    guests: invitation.guests.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      phone: g.phone,
      email: g.email,
      group_name: g.group_name,
      plus_allowed: g.plus_allowed,
      rsvp_status: g.rsvp_status,
      rsvp_at: g.rsvp_at?.toISOString() || null,
      rsvp_message: g.rsvp_message,
      dietary_notes: g.dietary_notes,
      viewed_at: g.viewed_at?.toISOString() || null,
    })),
    _count: invitation._count,
  };

  return (
    <main className="p-4 sm:p-8 min-h-screen bg-[#FAF8F5]">
      <InvitationCommandCenter invitation={serializedInvitation} baseUrl={baseUrl} />
    </main>
  );
}
