import { prisma } from "@/lib/prisma";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export const metadata = {
  title: "Dashboard • Krishna Super Admin",
};

export default async function AdminDashboard() {
  const [usersCount, activeInvCount, revThisMonth, companiesCount, recentUsers, recentInvites, recentPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.invitation.count({ where: { is_published: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "SUCCESS",
          created_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.organization.count({ where: { subscription_status: "ACTIVE" } }),
      prisma.user.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, created_at: true },
      }),
      prisma.invitation.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        include: { template: true },
      }),
      prisma.payment.findMany({
        orderBy: { created_at: "desc" },
        take: 4,
        select: { id: true, amount: true, status: true, gateway: true, created_at: true },
      }),
    ]);

  const formattedUsers = recentUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at.toISOString().slice(0, 10),
  }));

  const formattedInvites = recentInvites.map((inv) => ({
    id: inv.id,
    title: inv.title,
    slug: inv.slug,
    template: inv.template.name,
    is_published: inv.is_published,
    created_at: inv.created_at.toISOString().slice(0, 10),
  }));

  const formattedPayments = recentPayments.map((p) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    gateway: p.gateway,
    created_at: p.created_at.toISOString().slice(0, 10),
  }));

  return (
    <DashboardOverview
      users={usersCount}
      activeInv={activeInvCount}
      revenue={revThisMonth._sum.amount ?? 0}
      companies={companiesCount}
      recentUsers={formattedUsers}
      recentInvites={formattedInvites}
      recentPayments={formattedPayments}
    />
  );
}
