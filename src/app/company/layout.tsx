import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const nav = [
  { href: "/company", label: "Dashboard" },
  { href: "/company/invitations", label: "Invitations" },
  { href: "/company/team", label: "Team" },
  { href: "/company/subscription", label: "Subscription" },
  { href: "/company/settings", label: "Settings" },
];

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/company");
  const member = await prisma.orgMember.findFirst({ where: { user_id: user.id } });
  if (!member) redirect("/pricing?plan=company");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Company</h2>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded px-3 py-2 text-sm hover:bg-white">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
