import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Edit3, Share2, Library, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import { EventIcon } from "@/components/EventIcon";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/library");

  const created = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { template: true, _count: { select: { guests: true, views: true } } },
    orderBy: { updated_at: "desc" },
  });

  const downloaded = await prisma.payment.findMany({
    where: { user_id: user.id, status: "SUCCESS", invitation_id: { not: null } },
    include: {
      invitation: { include: { template: true, user: { select: { name: true, email: true } } } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
          <Library className="h-3 w-3" />
          My Library
        </div>
        <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Downloaded & Created
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Everything you built or picked up from the community lives here. Pick one to edit, share a preview, or sell access.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">Created by you</h2>
          <Link href="/dashboard/create" className="text-xs font-bold text-rose-700 hover:text-rose-800">
            + New
          </Link>
        </div>
        {created.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="No creations yet"
            body="Start a blank design or pick a template from the gallery."
            cta={{ href: "/dashboard/create", label: "Create your first" }}
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((inv) => (
              <LibraryCard
                key={inv.id}
                id={inv.id}
                title={inv.title}
                eventType={inv.event_type}
                templateName={inv.template.name}
                tone="created"
                stats={{ views: inv._count.views, guests: inv._count.guests }}
                isPublished={inv.is_published}
                inCommunity={inv.is_in_community}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">Downloaded from community</h2>
          <Link href="/community" className="text-xs font-bold text-amber-700 hover:text-amber-800">
            Browse more
          </Link>
        </div>
        {downloaded.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Nothing bought yet"
            body="Explore community-built templates and buy one with a single tap."
            cta={{ href: "/community", label: "Open community" }}
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {downloaded.map((p) => p.invitation && (
              <LibraryCard
                key={p.id}
                id={p.invitation.id}
                title={p.invitation.title}
                eventType={p.invitation.event_type}
                templateName={p.invitation.template.name}
                tone="downloaded"
                creator={p.invitation.user.name ?? p.invitation.user.email}
                price={p.amount}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LibraryCard({
  id, title, eventType, templateName, tone, stats, isPublished, inCommunity, creator, price,
}: {
  id: string;
  title: string;
  eventType: string;
  templateName: string;
  tone: "created" | "downloaded";
  stats?: { views: number; guests: number };
  isPublished?: boolean;
  inCommunity?: boolean;
  creator?: string;
  price?: number;
}) {
  const toneBar =
    tone === "created"
      ? "bg-gradient-to-r from-rose-500 to-amber-500"
      : "bg-gradient-to-r from-sky-500 to-indigo-500";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${toneBar}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700">
            <EventIcon name={null} className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">{title}</h3>
            <p className="text-[11px] text-stone-500">
              {eventType.toLowerCase()} · {templateName}
            </p>
          </div>
        </div>
        {tone === "created" ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-600"
          }`}>
            {isPublished ? "Live" : "Draft"}
          </span>
        ) : (
          <span className="rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
            Bought
          </span>
        )}
      </div>

      {tone === "created" && stats && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-stone-50 p-2 text-[11px] text-stone-600 border border-stone-100">
          <span>{stats.views} views</span>
          <span className="text-stone-300">•</span>
          <span>{stats.guests} guests</span>
          {inCommunity && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              In community
            </span>
          )}
        </div>
      )}
      {tone === "downloaded" && creator && (
        <p className="mt-3 text-[11px] text-stone-500">
          By <span className="font-semibold text-stone-800">{creator}</span>
          {price ? ` · ₹${price.toLocaleString()}` : ""}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/dashboard/invitations/${id}`}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
        >
          <Edit3 className="h-3 w-3" />
          Edit
        </Link>
        <Link
          href={`/dashboard/invitations/${id}/share`}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <Share2 className="h-3 w-3" />
          Share
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, cta }: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 text-rose-700">
        {icon}
      </div>
      <h3 className="mt-3 font-serif text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-500 max-w-xs mx-auto">{body}</p>
      <Link href={cta.href} className="mt-4 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white">
        {cta.label}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
