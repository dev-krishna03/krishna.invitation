import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Compass, ArrowLeft, Eye } from "lucide-react";
import { BuyTemplateButton } from "./BuyTemplateButton";

export default async function CommunityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      template: true,
      user: { select: { name: true, email: true } },
      _count: { select: { views: true } },
    },
  });
  if (!inv || !inv.is_in_community) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to community
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200" />
        </div>

        <aside className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Compass className="h-3 w-3" />
              From the community
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold text-stone-900">{inv.title}</h1>
            <p className="mt-1 text-xs text-stone-500">
              {inv.event_type.toLowerCase()} · {inv.template.name}
            </p>
            <p className="mt-3 text-xs text-stone-500 inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {inv._count.views} views
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-stone-500">Creator</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {inv.user.name ?? inv.user.email}
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {inv.community_price ? `₹${inv.community_price.toLocaleString()}` : "Free"}
              </span>
              {inv.community_price ? (
                <span className="text-[11px] text-stone-500">one-time</span>
              ) : null}
            </div>
            <BuyTemplateButton
              invitationId={inv.id}
              price={inv.community_price ?? 0}
              currency={inv.community_currency ?? "INR"}
            />
            <p className="mt-3 text-[11px] text-stone-500">
              After payment, a copy is added to your library — you can edit everything.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
