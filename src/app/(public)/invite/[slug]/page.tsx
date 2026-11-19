import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getIntegration } from "@/lib/settings";
import { getTemplate } from "@/templates/registry";
import { RsvpForm } from "@/components/RsvpForm";

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
    include: { template: true, events: { orderBy: { sort_order: "asc" } }, photos: { orderBy: { sort_order: "asc" } } },
  });
  if (!invitation || !invitation.is_published) notFound();
  if (invitation.expires_at && invitation.expires_at < new Date()) notFound();

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
      <Component data={data} mapApiKey={mapApiKey} locale={invitation.locale} />
      <RsvpForm slug={slug} />
    </div>
  );
}
