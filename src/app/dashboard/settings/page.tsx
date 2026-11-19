import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Gift, Coins, Globe, Shield } from "lucide-react";

export const metadata = {
  title: "Account Settings • Krishna Host Dashboard",
};

export default async function AccountSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Account Profile
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Manage your personal details, referral bonuses, and language preferences.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-stone-50/50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Profile Information
          </h3>
        </div>
        <div className="p-6 divide-y divide-stone-100">
          <div className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-stone-500 flex items-center gap-2">
              <User className="h-4 w-4 text-stone-400" />
              <span>Full Name</span>
            </span>
            <span className="font-semibold text-stone-900">{dbUser?.name ?? "Host"}</span>
          </div>

          <div className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-stone-500 flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone-400" />
              <span>Email Address</span>
            </span>
            <span className="font-semibold text-stone-900">{dbUser?.email ?? user.email}</span>
          </div>

          <div className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-stone-500 flex items-center gap-2">
              <Gift className="h-4 w-4 text-rose-500" />
              <span>Referral Code</span>
            </span>
            <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {dbUser?.referral_code ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-stone-500 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>Referral Credits</span>
            </span>
            <span className="font-semibold text-amber-800">
              ₹{dbUser?.referral_credit ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-stone-500 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Default Language</span>
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 uppercase">
              {dbUser?.locale ?? "en"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
