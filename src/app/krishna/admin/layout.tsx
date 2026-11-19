import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasAdminCookie } from "@/lib/admin-access";

const nav = [
  { href: "/krishna/admin", label: "Dashboard" },
  { href: "/krishna/admin/templates", label: "Templates" },
  { href: "/krishna/admin/event-types", label: "Occasions" },
  { href: "/krishna/admin/users", label: "Users" },
  { href: "/krishna/admin/organizations", label: "Companies" },
  { href: "/krishna/admin/plans", label: "Plans" },
  { href: "/krishna/admin/gateways", label: "Payment Gateways" },
  { href: "/krishna/admin/integrations", label: "Integrations" },
  { href: "/krishna/admin/coupons", label: "Coupons" },
  { href: "/krishna/admin/payments", label: "Payments" },
  { href: "/krishna/admin/settings", label: "Site Settings" },
  { href: "/krishna/admin/audit-log", label: "Audit Log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viaCode = await hasAdminCookie();
  if (!viaCode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/krishna");
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "SUPER_ADMIN") redirect("/krishna");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
          Super Admin
        </h2>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded px-3 py-2 text-sm hover:bg-white">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-white">{children}</div>
    </div>
  );
}
