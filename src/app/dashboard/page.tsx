import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sparkles, Eye, Users, PlusCircle, ArrowRight, ExternalLink } from "lucide-react";
import { FlowDiagram } from "@/components/dashboard/FlowDiagram";
import { ConciergeBookingModal } from "@/components/concierge/ConciergeBookingModal";

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
      {/* Workflow overview */}
      <FlowDiagram />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#12042F]">
            My Celebrations
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            View live status, guest responses, and manage your personalized digital cards.
          </p>
        </div>

        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-full bg-[#6520EE] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5213D2] transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Invitation</span>
        </Link>
      </div>

      {/* Done-For-You VIP Concierge Banner */}
      <ConciergeBookingModal variant="card" />

      {/* Invitations Grid */}
      {invitations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E5D9FC] bg-white p-12 text-center max-w-lg mx-auto mt-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F1FE] text-[#6520EE] shadow-xs">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#12042F]">
            No Invitations Created Yet
          </h3>
          <p className="mt-2 text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
            Choose from our wedding, birthday, or celebration templates to create your first digital
            invitation with background music and WhatsApp RSVPs.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6520EE] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5213D2]"
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
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs hover:border-[#6520EE] hover:shadow-lg hover:shadow-[#6520EE]/5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#F5F1FE] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6520EE] border border-[#E5D9FC]">
                    {inv.event_type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      inv.is_published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-[#F5F1FE] text-[#7A7387]"
                    }`}
                  >
                    {inv.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                  {inv.title}
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">Theme: {inv.template.name}</p>

                {/* Stats Bar */}
                <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#FAF9FD] p-3 text-xs text-[#5B556B] border border-[#E5D9FC]">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[#6520EE]" />
                    <span>{inv._count.views} Views</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#6520EE]" />
                    <span>{inv._count.guests} Guests</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-[#F5F1FE]">
                <Link
                  href={`/dashboard/invitations/${inv.id}`}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-[#12042F] py-2 text-xs font-semibold text-white hover:bg-[#6520EE] transition-colors"
                >
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href={`/invite/${inv.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-[#E5D9FC] py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] transition-colors"
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
