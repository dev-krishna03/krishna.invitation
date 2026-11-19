import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getIntegration } from "@/lib/settings";
import { getTemplate } from "@/templates/registry";
import { RsvpForm } from "@/components/RsvpForm";

type Params = Promise<{ slug: string; guestSlug: string }>;

export default async function GuestInvitePage({ params }: { params: Params }) {
  const { slug, guestSlug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { template: true, events: { orderBy: { sort_order: "asc" } }, photos: { orderBy: { sort_order: "asc" } } },
  });
  if (!invitation || !invitation.is_published) notFound();

  const guest = await prisma.guest.findUnique({
    where: { invitation_id_slug: { invitation_id: invitation.id, slug: guestSlug } },
  });

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

  return (
    <div>
      <Component data={data} guestName={guest?.name} mapApiKey={mapApiKey} locale={invitation.locale} />
      <RsvpForm slug={slug} guestSlug={guestSlug} prefilledName={guest?.name} />
    </div>
  );
}
