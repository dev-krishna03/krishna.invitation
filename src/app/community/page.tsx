import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Compass, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { EventIcon } from "@/components/EventIcon";

export default async function CommunityPage() {
  const items = await prisma.invitation.findMany({
    where: { is_in_community: true },
    include: {
      template: true,
      user: { select: { name: true, email: true } },
      _count: { select: { views: true } },
    },
    orderBy: { updated_at: "desc" },
    take: 60,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
          <Compass className="h-3 w-3" />
          Community Marketplace
        </div>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Templates from our creators
        </h1>
        <p className="mt-2 text-sm text-stone-600 max-w-xl mx-auto">
          Buy a design built by another host, adapt it to your event, and save hours.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center max-w-md mx-auto">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 text-amber-700">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">Nothing shared yet</h3>
          <p className="mt-2 text-xs text-stone-500">
            As creators publish templates to the community, they will show up here.
          </p>
          <Link
            href="/dashboard/library"
            className="mt-6 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white"
          >
            Open my library
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((inv) => (
            <article
              key={inv.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 to-rose-500" />
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-700">
                    <EventIcon name={null} className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
                      {inv.title}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      By {inv.user.name ?? inv.user.email} · {inv._count.views} views
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-serif text-xl font-bold text-stone-900">
                  {inv.community_price ? `₹${inv.community_price.toLocaleString()}` : "Free"}
                </span>
                <Link
                  href={`/community/${inv.slug}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                >
                  <ShoppingBag className="h-3 w-3" />
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
