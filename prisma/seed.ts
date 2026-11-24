import {
  PrismaClient,
  UserRole,
  TemplateCategory,
  PlanType,
  BillingPeriod,
  Gateway,
  Environment,
  CreatorPlanTier,
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

  // ---- Creator plans ----
  const creatorPlans: {
    slug: string;
    tier: CreatorPlanTier;
    name: string;
    tagline: string;
    monthly: number;
    yearly: number;
    max_templates_for_sale: number | null;
    max_live_invitations: number | null;
    platform_fee_pct: number;
    can_sell: boolean;
    white_label: boolean;
    features: string[];
    sort_order: number;
  }[] = [
    {
      slug: "creator-free",
      tier: CreatorPlanTier.FREE,
      name: "Free Hobbyist",
      tagline: "Build invitations for your own events.",
      monthly: 0,
      yearly: 0,
      max_templates_for_sale: 0,
      max_live_invitations: 1,
      platform_fee_pct: 30,
      can_sell: false,
      white_label: false,
      features: [
        "Create templates in your workspace",
        "Import community templates",
        "1 live invitation at a time",
        "Not available for sale",
      ],
      sort_order: 1,
    },
    {
      slug: "creator-pro",
      tier: CreatorPlanTier.PRO,
      name: "Creator Pro",
      tagline: "Earn from your designs.",
      monthly: 499,
      yearly: 4999,
      max_templates_for_sale: 10,
      max_live_invitations: 10,
      platform_fee_pct: 20,
      can_sell: true,
      white_label: false,
      features: [
        "Sell up to 10 templates on the marketplace",
        "20% platform fee per sale",
        "10 live invitations at once",
        "Priority creator support",
      ],
      sort_order: 2,
    },
    {
      slug: "creator-studio",
      tier: CreatorPlanTier.STUDIO,
      name: "Studio Elite",
      tagline: "Run an invitation agency.",
      monthly: 1999,
      yearly: 19999,
      max_templates_for_sale: null,
      max_live_invitations: null,
      platform_fee_pct: 10,
      can_sell: true,
      white_label: true,
      features: [
        "Unlimited templates for sale",
        "10% platform fee per sale",
        "Unlimited live invitations",
        "White-label customer links",
        "Team workspace + API access",
      ],
      sort_order: 3,
    },
  ];
  for (const p of creatorPlans) {
    await prisma.creatorPlan.upsert({
      where: { slug: p.slug },
      update: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        monthly_price: p.monthly,
        yearly_price: p.yearly,
        max_templates_for_sale: p.max_templates_for_sale,
        max_live_invitations: p.max_live_invitations,
        platform_fee_pct: p.platform_fee_pct,
        can_sell: p.can_sell,
        white_label: p.white_label,
        features: p.features,
        sort_order: p.sort_order,
      },
      create: {
        slug: p.slug,
        tier: p.tier,
        name: p.name,
        tagline: p.tagline,
        monthly_price: p.monthly,
        yearly_price: p.yearly,
        max_templates_for_sale: p.max_templates_for_sale,
        max_live_invitations: p.max_live_invitations,
        platform_fee_pct: p.platform_fee_pct,
        can_sell: p.can_sell,
        white_label: p.white_label,
        features: p.features,
        sort_order: p.sort_order,
      },
    });
  }

  // Default every existing user to the Free plan if they don't have one.
  const freePlan = await prisma.creatorPlan.findFirst({ where: { tier: CreatorPlanTier.FREE } });
  if (freePlan) {
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const u of users) {
      const existing = await prisma.userCreatorSubscription.findUnique({ where: { user_id: u.id } });
      if (!existing) {
        await prisma.userCreatorSubscription.create({
          data: { user_id: u.id, plan_id: freePlan.id },
        });
      }
    }
  }

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
    { key: "supported_currencies", value: ["INR", "USD"] },
    { key: "usd_to_inr", value: 84 },
    { key: "maintenance_mode", value: false },
    { key: "brevo_sender", value: { email: "", name: "" } },
    { key: "brevo_template_map", value: {} },
    {
      key: "landing_copy",
      value: {
        hero_badge: "Over 50,000+ Sacred Celebrations Crafted",
        hero_title: "Bespoke Digital Invitations for Every Moment That Matters.",
        hero_subtitle:
          "Luxury interactive invitations with background music, multi-day timelines, Google Maps directions, and 1-click WhatsApp RSVP tracking.",
        footer_tagline: "Crafted with love in India, trusted by families worldwide.",
      },
    },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as object },
    });
  }

  // Editor element catalog — the palette the invitation editor shows. Admin can
  // extend / toggle these from /krishna/admin/elements.
  const elements: {
    slug: string;
    name: string;
    kind:
      | "TEXT" | "HEADING" | "NAMES" | "MESSAGE" | "BUTTON" | "DIVIDER" | "MOTIF"
      | "IMAGE" | "QRCODE" | "BADGE" | "COUNTDOWN" | "MAP" | "MUSIC" | "VIDEO"
      | "GALLERY" | "RSVP" | "SOCIAL" | "CONTAINER";
    category: string;
    icon: string;
    description: string;
    default_props: Record<string, unknown>;
    is_pro_only?: boolean;
  }[] = [
    { slug: "heading", name: "Heading", kind: "HEADING", category: "text", icon: "Type", description: "Section headings and titles.", default_props: { content: "A Royal Affair", fontSize: 42, fontWeight: 700 } },
    { slug: "names", name: "Couple Names", kind: "NAMES", category: "text", icon: "Heart", description: "Primary + secondary host name.", default_props: { primary: "Aarav", secondary: "Priya", separator: "&" } },
    { slug: "message", name: "Message", kind: "MESSAGE", category: "text", icon: "MessageSquare", description: "Welcome note or verse.", default_props: { content: "With the blessings of our families…" } },
    { slug: "divider", name: "Divider", kind: "DIVIDER", category: "decor", icon: "Minus", description: "Ornamental line between sections.", default_props: { style: "ornament", color: "#8b1e3f" } },
    { slug: "motif", name: "Motif", kind: "MOTIF", category: "decor", icon: "Sparkles", description: "Decorative emblem.", default_props: { symbol: "🕉️" } },
    { slug: "button", name: "RSVP Button", kind: "BUTTON", category: "action", icon: "MousePointerClick", description: "Call-to-action button.", default_props: { label: "RSVP", href: "#rsvp" } },
    { slug: "image", name: "Image", kind: "IMAGE", category: "media", icon: "Image", description: "Upload a photo or illustration.", default_props: {} },
    { slug: "gallery", name: "Photo Gallery", kind: "GALLERY", category: "media", icon: "Images", description: "Multi-photo swipe gallery.", default_props: { photos: [] }, is_pro_only: true },
    { slug: "music", name: "Background Music", kind: "MUSIC", category: "media", icon: "Music", description: "Looped audio with mute control.", default_props: { autoplay: true } },
    { slug: "video", name: "Video", kind: "VIDEO", category: "media", icon: "Video", description: "Embed a short clip.", default_props: {}, is_pro_only: true },
    { slug: "countdown", name: "Countdown", kind: "COUNTDOWN", category: "data", icon: "Clock", description: "Live countdown to the event.", default_props: { targetDate: "" } },
    { slug: "map", name: "Venue Map", kind: "MAP", category: "data", icon: "Map", description: "Google Maps embed.", default_props: { address: "" } },
    { slug: "qrcode", name: "QR Code", kind: "QRCODE", category: "action", icon: "QrCode", description: "QR for RSVP or location link.", default_props: { value: "" } },
    { slug: "rsvp-form", name: "RSVP Form", kind: "RSVP", category: "action", icon: "ClipboardCheck", description: "Guest RSVP capture.", default_props: { allowPlusOne: true } },
    { slug: "social", name: "Social Icons", kind: "SOCIAL", category: "action", icon: "Share2", description: "Share to WhatsApp / Instagram.", default_props: { networks: ["whatsapp", "instagram"] } },
    { slug: "badge-seal", name: "Save-The-Date Seal", kind: "BADGE", category: "decor", icon: "BadgeCheck", description: "Wax-seal-style badge.", default_props: { label: "Save The Date", icon: "💍" } },
    { slug: "event-row", name: "Event Row", kind: "CONTAINER", category: "layout", icon: "Layers", description: "Date + venue + time for one event.", default_props: { name: "Ceremony" } },
  ];
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i];
    await prisma.templateElement.upsert({
      where: { slug: e.slug },
      update: {
        name: e.name,
        kind: e.kind,
        category: e.category,
        icon: e.icon,
        description: e.description,
        default_props: e.default_props as object,
        is_pro_only: !!e.is_pro_only,
        sort_order: i,
      },
      create: {
        slug: e.slug,
        name: e.name,
        kind: e.kind,
        category: e.category,
        icon: e.icon,
        description: e.description,
        default_props: e.default_props as object,
        is_pro_only: !!e.is_pro_only,
        sort_order: i,
      },
    });
  }

  // Seed policies once; super admin can edit from /krishna/admin/policies.
  const policies: { slug: string; title: string; summary: string; content: string }[] = [
    {
      slug: "terms",
      title: "Terms of Service",
      summary: "The rules you agree to when using the platform.",
      content:
        "# Terms of Service\n\nBy using this platform you agree to these terms. The platform is provided as-is. You retain ownership of the content you upload. The platform may remove content that violates our acceptable-use policy.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      summary: "What we collect, why, and how to control it.",
      content:
        "# Privacy Policy\n\nWe collect your email, invitation data and payment metadata to run the service. We never sell your data. You can export or delete your data at any time from account settings.",
    },
    {
      slug: "refund",
      title: "Refund Policy",
      summary: "When and how refunds are issued.",
      content:
        "# Refund Policy\n\nMarketplace purchases are generally final. You may request a refund within 48 hours if the template is clearly broken or materially misrepresented. Contact support with your purchase id.",
    },
    {
      slug: "acceptable-use",
      title: "Acceptable Use",
      summary: "Content and behavior the platform does not allow.",
      content:
        "# Acceptable Use\n\nNo hate speech, harassment, illegal content, or impersonation. No misleading pricing. The platform may take down any listing that violates this policy.",
    },
    {
      slug: "creator-agreement",
      title: "Creator Agreement",
      summary: "The terms sellers accept when listing templates.",
      content:
        "# Creator Agreement\n\nWhen you list a template on the marketplace, you grant the platform a non-exclusive license to display and sell copies at the price you set. The platform fee for your active plan is applied to each sale.",
    },
  ];
  for (const p of policies) {
    await prisma.policy.upsert({
      where: { slug: p.slug },
      update: {}, // leave existing text alone on re-seed; super admin edits are authoritative
      create: {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        content: p.content,
      },
    });
  }

  // (settings block is handled above; keeping original list behavior for completeness)
  const _settings_placeholder: { key: string; value: unknown }[] = [];
  void _settings_placeholder;
  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
