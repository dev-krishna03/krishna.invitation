import { prisma } from "./prisma";
import { CreatorPlanTier, type CreatorPlan, type UserCreatorSubscription } from "@prisma/client";

export type WorkspaceSummary = {
  user_id: string;
  plan: CreatorPlan;
  subscription: UserCreatorSubscription;
  templates: {
    total: number;
    draft: number;
    live: number;
    sales_count: number;
    revenue_total: number;
  };
  invitations: {
    total: number;
    live: number;
  };
};

export async function ensureCreatorSubscription(userId: string): Promise<{
  plan: CreatorPlan;
  subscription: UserCreatorSubscription;
}> {
  const existing = await prisma.userCreatorSubscription.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });
  if (existing) return { plan: existing.plan, subscription: existing };

  const free = await prisma.creatorPlan.findUniqueOrThrow({ where: { tier: CreatorPlanTier.FREE } });
  const subscription = await prisma.userCreatorSubscription.create({
    data: { user_id: userId, plan_id: free.id },
  });
  return { plan: free, subscription };
}

export async function getWorkspaceSummary(userId: string): Promise<WorkspaceSummary> {
  const { plan, subscription } = await ensureCreatorSubscription(userId);

  const [templates, draftTemplates, liveTemplates, saleAgg, invitationsTotal, invitationsLive] = await Promise.all([
    prisma.template.count({ where: { owner_user_id: userId } }),
    prisma.template.count({ where: { owner_user_id: userId, is_in_marketplace: false } }),
    prisma.template.count({ where: { owner_user_id: userId, is_in_marketplace: true } }),
    prisma.template.aggregate({
      _sum: { sales_count: true, revenue_total: true },
      where: { owner_user_id: userId },
    }),
    prisma.invitation.count({ where: { user_id: userId } }),
    prisma.invitation.count({ where: { user_id: userId, is_published: true } }),
  ]);

  return {
    user_id: userId,
    plan,
    subscription,
    templates: {
      total: templates,
      draft: draftTemplates,
      live: liveTemplates,
      sales_count: saleAgg._sum.sales_count ?? 0,
      revenue_total: saleAgg._sum.revenue_total ?? 0,
    },
    invitations: {
      total: invitationsTotal,
      live: invitationsLive,
    },
  };
}

export type SellCheck = { ok: true } | { ok: false; reason: string };

export async function canSellMoreTemplates(userId: string): Promise<SellCheck> {
  const { plan } = await ensureCreatorSubscription(userId);
  if (!plan.can_sell) {
    return { ok: false, reason: `Your ${plan.name} plan doesn't allow selling. Upgrade to Creator Pro or Studio Elite.` };
  }
  if (plan.max_templates_for_sale === null) return { ok: true };
  const live = await prisma.template.count({
    where: { owner_user_id: userId, is_in_marketplace: true },
  });
  if (live >= plan.max_templates_for_sale) {
    return {
      ok: false,
      reason: `You've reached your plan's limit of ${plan.max_templates_for_sale} templates for sale. Upgrade for more.`,
    };
  }
  return { ok: true };
}

export async function canCreateMoreLiveInvitations(userId: string): Promise<SellCheck> {
  const { plan } = await ensureCreatorSubscription(userId);
  if (plan.max_live_invitations === null) return { ok: true };
  const live = await prisma.invitation.count({ where: { user_id: userId, is_published: true } });
  if (live >= plan.max_live_invitations) {
    return {
      ok: false,
      reason: `Your plan allows ${plan.max_live_invitations} live invitations. Unpublish one or upgrade.`,
    };
  }
  return { ok: true };
}
