import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HostDashboardShell } from "@/components/dashboard/HostDashboardShell";

export const metadata = {
  title: "Host Dashboard • Krishna Invitations",
  description: "Manage your digital invitations, guests, and RSVPs.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  return (
    <HostDashboardShell userEmail={user.email}>
      {children}
    </HostDashboardShell>
  );
}
