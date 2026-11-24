import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getIntegration } from "@/lib/settings";
import { getTemplate } from "@/templates/registry";
import { RsvpForm } from "@/components/RsvpForm";
import { EventEndedView } from "@/components/invite/EventEndedView";
import { GuestExtrasSuite } from "@/components/invite/GuestExtrasSuite";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { slug } });
  if (!invitation) return { title: "Invitation" };
  return {
    title: invitation.title,
    openGraph: { title: invitation.title, description: "You're invited" },
  };
}

export default async function InvitePage({ params }: { params: Params }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      template: true,
      events: { orderBy: { sort_order: "asc" } },
      photos: { orderBy: { sort_order: "asc" } },
      wishes: { where: { is_approved: true }, orderBy: { created_at: "desc" } },
    },
  });
  if (!invitation || !invitation.is_published) notFound();

  // If expired, render the celebration recap page instead of 404
  if (invitation.expires_at && invitation.expires_at < new Date()) {
    const rawData = (invitation.data as Record<string, unknown>) || {};
    const primary = (rawData.primaryName as string) || "";
    const secondary = (rawData.secondaryName as string) || "";
    const names = primary && secondary ? `${primary} & ${secondary}` : primary || secondary;
    const dateStr = (rawData.eventDate as string) || (invitation.events[0]?.date ? new Date(invitation.events[0].date).toLocaleDateString() : undefined);
    const venue = (rawData.venueName as string) || invitation.events[0]?.venue || undefined;

    return (
      <EventEndedView
        title={invitation.title}
        eventType={invitation.event_type}
        names={names}
        dateStr={dateStr}
        venue={venue}
        photos={invitation.photos}
      />
    );
  }

  const registered = getTemplate(invitation.template.slug);
  if (!registered) notFound();
  const { Component } = registered;

  const maps = await getIntegration("google-maps");
  const mapApiKey = (maps?.api_key as string | undefined) ?? undefined;

  const data = {
    ...(invitation.data as Record<string, unknown>),
    events: invitation.events,
    photos: invitation.photos,
  };

  const formattedEvents = invitation.events.map((e) => ({
    id: e.id,
    name: e.name,
    venue: e.venue,
    date: e.date ? e.date.toISOString() : null,
    start_time: e.start_time,
    end_time: e.end_time,
  }));

  const formattedWishes = invitation.wishes.map((w) => ({
    id: w.id,
    author_name: w.author_name,
    message: w.message,
    photo_url: w.photo_url,
    created_at: w.created_at.toISOString(),
  }));

  return (
    <div className={invitation.is_protected ? "select-none" : ""}>
      <Component data={data} mapApiKey={mapApiKey} locale={invitation.locale} />
      <RsvpForm slug={slug} />
      <GuestExtrasSuite
        invitationId={invitation.id}
        slug={slug}
        title={invitation.title}
        events={formattedEvents}
        guest={null}
        initialWishes={formattedWishes}
        giftUpiId={invitation.gift_upi_id}
        giftNotes={invitation.gift_notes}
      />
    </div>
  );
}
