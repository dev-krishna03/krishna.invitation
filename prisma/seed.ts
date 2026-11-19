import {
  PrismaClient,
  UserRole,
  TemplateCategory,
  PlanType,
  BillingPeriod,
  Gateway,
  Environment,
} from "@prisma/client";
import { generateReferralCode } from "../src/lib/referral";

const prisma = new PrismaClient();

type SeedNode = {
  slug: string;
  name: string;
  icon: string;
  is_featured?: boolean;
  children?: SeedNode[];
};

// Top-level occasions with sub-occasions (Haldi/Mehndi/Sangeet/Reception under Wedding, etc.).
const EVENT_TREE: SeedNode[] = [
  {
    slug: "wedding",
    name: "Wedding",
    icon: "heart",
    is_featured: true,
    children: [
      { slug: "haldi", name: "Haldi", icon: "flower" },
      { slug: "mehndi", name: "Mehndi", icon: "palette" },
      { slug: "sangeet", name: "Sangeet", icon: "music" },
      { slug: "reception", name: "Reception", icon: "wine" },
      { slug: "pheras", name: "Pheras", icon: "flame" },
    ],
  },
  {
    slug: "engagement",
    name: "Engagement",
    icon: "gem",
    is_featured: true,
    children: [
      { slug: "roka", name: "Roka", icon: "bookheart" },
      { slug: "ring-ceremony", name: "Ring Ceremony", icon: "gem" },
    ],
  },
  {
    slug: "birthday",
    name: "Birthday",
    icon: "cake",
    is_featured: true,
    children: [
      { slug: "first-birthday", name: "1st Birthday", icon: "cake" },
      { slug: "milestone-birthday", name: "Milestone Birthday", icon: "star" },
    ],
  },
  {
    slug: "baby-shower",
    name: "Baby Shower",
    icon: "baby",
    children: [
      { slug: "godh-bharai", name: "Godh Bharai", icon: "baby" },
      { slug: "seemantham", name: "Seemantham", icon: "baby" },
    ],
  },
  {
    slug: "gruh-vastu",
    name: "Gruh Vastu",
    icon: "home",
    is_featured: true,
    children: [
      { slug: "vastu-pooja", name: "Vastu Pooja", icon: "flame" },
      { slug: "housewarming", name: "Housewarming", icon: "home" },
    ],
  },
  {
    slug: "anniversary",
    name: "Anniversary",
    icon: "calendar",
    children: [
      { slug: "silver-anniversary", name: "Silver Anniversary", icon: "sparkles" },
      { slug: "golden-anniversary", name: "Golden Anniversary", icon: "star" },
    ],
  },
  { slug: "namkaran", name: "Namkaran", icon: "baby" },
  { slug: "mundan", name: "Mundan", icon: "scissors" },
  { slug: "corporate", name: "Corporate", icon: "briefcase", children: [
    { slug: "product-launch", name: "Product Launch", icon: "sparkles" },
    { slug: "conference", name: "Conference", icon: "users" },
    { slug: "team-offsite", name: "Team Offsite", icon: "users" },
  ]},
  { slug: "pooja", name: "Pooja", icon: "flame", children: [
    { slug: "satyanarayan-pooja", name: "Satyanarayan Pooja", icon: "flame" },
    { slug: "ganesh-pooja", name: "Ganesh Pooja", icon: "flame" },
  ]},
  { slug: "festival", name: "Festival", icon: "party", children: [
    { slug: "diwali", name: "Diwali", icon: "flame" },
    { slug: "holi", name: "Holi", icon: "palette" },
    { slug: "navratri", name: "Navratri", icon: "music" },
  ]},
  { slug: "graduation", name: "Graduation", icon: "graduation" },
  { slug: "other", name: "Other", icon: "sparkles" },
];

async function seedTree(nodes: SeedNode[], parentId: string | null, startOrder = 0) {
  let order = startOrder;
  for (const node of nodes) {
    const row = await prisma.eventTypeConfig.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        icon: node.icon,
        is_featured: !!node.is_featured,
        parent_id: parentId,
        sort_order: order,
      },
      create: {
        slug: node.slug,
        name: node.name,
        icon: node.icon,
        is_featured: !!node.is_featured,
        parent_id: parentId,
        sort_order: order,
      },
    });
    order += 1;
    if (node.children && node.children.length) {
      await seedTree(node.children, row.id, 0);
    }
  }
}

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@invites.local" },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      email: "admin@invites.local",
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      referral_code: generateReferralCode(),
    },
  });

  // Clear labels on all rows (English-only now).
  await prisma.eventTypeConfig.updateMany({ data: { labels: {} } });
  await seedTree(EVENT_TREE, null, 0);

  const royal = await prisma.template.upsert({
    where: { slug: "royal-elegance" },
    update: {},
    create: {
      slug: "royal-elegance",
      name: "Royal Elegance",
      description: "Gold and burgundy, ornamental, timeless.",
      category: TemplateCategory.LUXURY,
      event_types: ["wedding", "engagement", "reception", "sangeet"],
      is_active: true,
      is_featured: true,
      sort_order: 1,
    },
  });
  const minimal = await prisma.template.upsert({
    where: { slug: "minimal-love" },
    update: {},
    create: {
      slug: "minimal-love",
      name: "Minimal Love",
      description: "Clean sage and white, modern.",
      category: TemplateCategory.MINIMAL,
      event_types: ["wedding", "anniversary", "birthday", "baby-shower", "gruh-vastu"],
      is_active: true,
      is_featured: true,
      sort_order: 2,
    },
  });

  for (const tpl of [royal, minimal]) {
    const tiers = [
      { duration_days: 30, price: 499 },
      { duration_days: 90, price: 999 },
      { duration_days: 365, price: 2499 },
    ];
    for (const t of tiers) {
      await prisma.templatePricing.upsert({
        where: { template_id_duration_days: { template_id: tpl.id, duration_days: t.duration_days } },
        update: { price: t.price },
        create: { template_id: tpl.id, ...t },
      });
    }
  }

  await prisma.subscriptionPlan.upsert({
    where: { slug: "individual-pro" },
    update: {},
    create: {
      slug: "individual-pro",
      name: "Individual Pro",
      type: PlanType.INDIVIDUAL,
      price: 1499,
      billing_period: BillingPeriod.YEARLY,
      max_invitations: 10,
      features: ["All templates for 1 year", "Analytics", "RSVP tracking"],
      sort_order: 1,
    },
  });
  await prisma.subscriptionPlan.upsert({
    where: { slug: "company-studio" },
    update: {},
    create: {
      slug: "company-studio",
      name: "Company Studio",
      type: PlanType.COMPANY,
      price: 24999,
      billing_period: BillingPeriod.YEARLY,
      max_members: 10,
      max_invitations: 500,
      features: ["All templates", "Team collaboration", "Priority support", "White-label option"],
      sort_order: 2,
    },
  });

  const gateways: { name: Gateway; slug: string; display_name: string }[] = [
    { name: Gateway.RAZORPAY, slug: "razorpay", display_name: "Razorpay" },
    { name: Gateway.CASHFREE, slug: "cashfree", display_name: "Cashfree" },
    { name: Gateway.PHONEPE, slug: "phonepe", display_name: "PhonePe" },
    { name: Gateway.STRIPE, slug: "stripe", display_name: "Stripe" },
  ];
  for (const g of gateways) {
    await prisma.paymentGateway.upsert({
      where: { name: g.name },
      update: {},
      create: { name: g.name, slug: g.slug, display_name: g.display_name, credentials: {}, is_active: false, environment: Environment.TEST },
    });
  }

  const integrations = [
    { slug: "brevo", name: "Brevo", display: "Brevo (Email)" },
    { slug: "google-maps", name: "Google Maps", display: "Google Maps" },
    { slug: "whatsapp", name: "WhatsApp", display: "WhatsApp Cloud API" },
  ];
  for (const i of integrations) {
    await prisma.integrationCredential.upsert({
      where: { service_slug: i.slug },
      update: {},
      create: { service_slug: i.slug, service_name: i.name, display_name: i.display, credentials: {} },
    });
  }

  const settings: { key: string; value: unknown }[] = [
    { key: "site_name", value: "Invitation Platform" },
    { key: "support_email", value: "support@invites.local" },
    { key: "default_currency", value: "INR" },
    { key: "maintenance_mode", value: false },
    { key: "brevo_sender", value: { email: "", name: "" } },
    { key: "brevo_template_map", value: {} },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as object },
    });
  }

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
