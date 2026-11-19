import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sparkles, Eye, Users, PlusCircle, ArrowRight, Calendar, ExternalLink } from "lucide-react";

export default async function MyInvitationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const invitations = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { template: true, _count: { select: { guests: true, views: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            My Celebrations
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            View live status, guest responses, and manage your personalized digital cards.
          </p>
        </div>

        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Invitation</span>
        </Link>
      </div>

      {/* Invitations Grid */}
      {invitations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center max-w-lg mx-auto mt-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-rose-700 shadow-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
            No Invitations Created Yet
          </h3>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            Choose from our royal wedding, birthday, or pooja templates to create your first digital
            invitation with background music and WhatsApp RSVPs.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/15"
            >
              <span>Create Your First Invite</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-rose-950/5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200/60">
                    {inv.event_type}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      inv.is_published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {inv.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                  {inv.title}
                </h3>
                <p className="mt-1 text-xs text-stone-500">Theme: {inv.template.name}</p>

                {/* Stats Bar */}
                <div className="mt-4 flex items-center gap-4 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600 border border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-rose-600" />
                    <span>{inv._count.views} Views</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span>{inv._count.guests} Guests</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-stone-100">
                <Link
                  href={`/dashboard/invitations/${inv.id}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                >
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href={`/invite/${inv.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Preview</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
