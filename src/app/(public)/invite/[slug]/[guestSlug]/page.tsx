import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getIntegration } from "@/lib/settings";
import { getTemplate } from "@/templates/registry";
import { RsvpForm } from "@/components/RsvpForm";
import { EventEndedView } from "@/components/invite/EventEndedView";
import { GuestExtrasSuite } from "@/components/invite/GuestExtrasSuite";

type Params = Promise<{ slug: string; guestSlug: string }>;

export default async function GuestInvitePage({ params }: { params: Params }) {
  const { slug, guestSlug } = await params;

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

  // If expired, show celebration recap
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

  const guest = await prisma.guest.findUnique({
    where: { invitation_id_slug: { invitation_id: invitation.id, slug: guestSlug } },
  });

  const registered = getTemplate(invitation.template.slug);
  if (!registered) notFound();
  const { Component } = registered;

  const maps = await getIntegration("google-maps");
  const mapApiKey = (maps?.api_key as string | undefined) ?? undefined;

  // Filter events if guest is scoped to specific ceremonies
  const filteredEvents =
    guest?.invited_events && guest.invited_events.length > 0
      ? invitation.events.filter((e) => guest.invited_events.includes(e.id) || guest.invited_events.includes(e.name))
      : invitation.events;

  const data = {
    ...(invitation.data as Record<string, unknown>),
    events: filteredEvents,
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
      <Component data={data} guestName={guest?.name} mapApiKey={mapApiKey} locale={invitation.locale} />
      <RsvpForm slug={slug} guestSlug={guestSlug} prefilledName={guest?.name} />
      <GuestExtrasSuite
        invitationId={invitation.id}
        slug={slug}
        title={invitation.title}
        events={formattedEvents}
        guest={
          guest
            ? {
                id: guest.id,
                name: guest.name,
                slug: guest.slug,
                invited_events: guest.invited_events,
                is_family: guest.is_family,
                family_members: guest.family_members,
                meal_preference: guest.meal_preference,
                plus_count: guest.plus_count,
                travel_details: guest.travel_details,
              }
            : null
        }
        initialWishes={formattedWishes}
        giftUpiId={invitation.gift_upi_id}
        giftNotes={invitation.gift_notes}
      />
    </div>
  );
}
