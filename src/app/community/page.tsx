import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Compass, ShoppingBag, Sparkles, ArrowRight, Store } from "lucide-react";
import { formatPrice, type Currency } from "@/lib/currency";

export default async function CommunityPage() {
  const templates = await prisma.template.findMany({
    where: {
      is_in_marketplace: true,
      // Only approved user templates reach the public marketplace.
      // Platform-seeded templates have no owner, so skip moderation for them.
      OR: [
        { owner_user_id: null },
        { moderation_status: "APPROVED" },
      ],
    },
    include: {
      owner: { select: { name: true, email: true, avatar_url: true } },
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
          Buy a design built by another creator at the price they set.
          Each creator keeps the lion&apos;s share — the platform takes a small fee from the sale.
        </p>
      </div>

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <article
              key={t.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 to-rose-500" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200">
                {t.thumbnail_url && (
                  <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-base font-bold text-stone-900 leading-tight">
                    {t.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                    {t.owner?.avatar_url ? (
                      <img
                        src={t.owner.avatar_url}
                        alt={t.owner.name || "Creator"}
                        className="h-4 w-4 rounded-full object-cover shrink-0"
                      />
                    ) : null}
                    <span className="truncate">
                      By {t.owner?.name ?? t.owner?.email ?? "Platform"} · {t.category.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-serif text-xl font-bold text-stone-900">
                  {t.price ? formatPrice(t.price, t.currency as Currency) : "Free"}
                </span>
                <Link
                  href={`/community/${t.slug}`}
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

function EmptyState() {
  return (
    <div className="mt-12 rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center max-w-md mx-auto">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 text-amber-700">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">Nothing listed yet</h3>
      <p className="mt-2 text-xs text-stone-500">
        Creators list templates from their workspace. Be the first.
      </p>
      <Link
        href="/dashboard/templates/new"
        className="mt-6 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white"
      >
        <Store className="h-3 w-3" />
        Create a template
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
