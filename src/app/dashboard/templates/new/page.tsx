import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewTemplateWizard } from "./NewTemplateWizard";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/templates/new");

  const sp = await searchParams;
  const [invitations, community] = await Promise.all([
    prisma.invitation.findMany({
      where: { user_id: user.id },
      select: { id: true, title: true, event_type: true, created_at: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.template.findMany({
      where: { is_in_marketplace: true, owner_user_id: { not: user.id } },
      select: { id: true, name: true, price: true, currency: true, category: true, owner: { select: { name: true, email: true } } },
      orderBy: { updated_at: "desc" },
      take: 24,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          New template
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Pick how this template enters your workspace.
        </p>
      </div>

      <NewTemplateWizard
        initialSource={
          sp.source === "community"
            ? "importCommunity"
            : sp.source === "invitation"
              ? "fromInvitation"
              : "blank"
        }
        invitations={invitations.map((i) => ({
          id: i.id,
          title: i.title,
          event_type: i.event_type,
          created_at: i.created_at.toISOString(),
        }))}
        community={community.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          currency: c.currency,
          category: c.category,
          creator: c.owner?.name ?? c.owner?.email ?? "Community creator",
        }))}
      />
    </div>
  );
}
