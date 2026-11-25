import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CompanyShell } from "@/components/company/CompanyShell";

export const metadata = {
  title: "Agency Studio & Invitation Editor • Invitation",
  description: "Visual web invitation editor for event planners and wedding studios.",
};

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orgName = "Krishna Celebrations Studio";

  if (user) {
    let member = await prisma.orgMember.findFirst({
      where: { user_id: user.id },
      include: { org: true },
    });

    // Auto-provision demo studio if none exists so they can test immediately
    if (!member) {
      let defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await prisma.organization.create({
          data: {
            name: "Krishna Celebrations Studio",
            slug: "krishna-studio",
            subscription_status: "ACTIVE",
          },
        });
      }
      member = await prisma.orgMember.create({
        data: {
          org_id: defaultOrg.id,
          user_id: user.id,
          role: "OWNER",
        },
        include: { org: true },
      });
    }

    if (member?.org) {
      orgName = member.org.name;
    }
  }

  return <CompanyShell orgName={orgName}>{children}</CompanyShell>;
}
