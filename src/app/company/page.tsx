import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AgencyFlowDashboard } from "@/components/company/AgencyFlowDashboard";

export const metadata = {
  title: "Agency Studio & Workflow Engine • Krishna Invitations",
  description: "Create, buy community templates, customize for clients, license guest quotas, and share access.",
};

export default async function CompanyDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let org = null;
  if (user) {
    const member = await prisma.orgMember.findFirst({
      where: { user_id: user.id },
      include: { org: true },
    });
    org = member?.org ?? null;
  }

  return (
    <main className="p-6">
      <AgencyFlowDashboard />
    </main>
  );
}
