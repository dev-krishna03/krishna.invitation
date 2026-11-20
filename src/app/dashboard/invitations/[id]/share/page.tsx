import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ShareFlow } from "./ShareFlow";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/library");

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { template: true },
  });
  if (!invitation || invitation.user_id !== user.id) notFound();

  return (
    <ShareFlow
      invitation={{
        id: invitation.id,
        title: invitation.title,
        slug: invitation.slug,
        preview_token: invitation.preview_token,
        preview_approved: invitation.preview_approved,
        access_limit: invitation.access_limit,
        access_used: invitation.access_used,
        is_published: invitation.is_published,
        is_in_community: invitation.is_in_community,
        community_price: invitation.community_price,
      }}
    />
  );
}
