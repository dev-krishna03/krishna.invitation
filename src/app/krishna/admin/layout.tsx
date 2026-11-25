import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasAdminCookie } from "@/lib/admin-access";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Super Admin Panel • Invitation",
  description: "Global administration and platform governance for Invitation.",
};

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

  return <AdminShell>{children}</AdminShell>;
}
