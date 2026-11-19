import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, Eye, Users, Sparkles, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Analytics • Krishna Host Dashboard",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invitations = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { _count: { select: { views: true, guests: true } } },
  });

  const totalViews = invitations.reduce((s, i) => s + i._count.views, 0);
  const totalGuests = invitations.reduce((s, i) => s + i._count.guests, 0);

  const metrics = [
    {
      label: "Active Invitations",
      value: invitations.length,
      icon: Sparkles,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      label: "Total Card Views",
      value: totalViews,
      icon: Eye,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Total Invited Guests",
      value: totalGuests,
      icon: Users,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Celebration Analytics
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Monitor your guest attendance, link opens, and RSVP response rates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm hover:border-amber-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">{m.label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl font-bold text-stone-900">{m.value}</p>
              <p className="mt-2 text-[11px] text-stone-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span>Real-time sync enabled</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
