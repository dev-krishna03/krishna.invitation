import {
  PrismaClient,
  UserRole,
  TemplateCategory,
  CreatorPlanTier,
  Gateway,
  PaymentStatus,
  RsvpStatus,
} from "@prisma/client";
import { generateReferralCode } from "../src/lib/referral";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding comprehensive demo data...");

  // 1. Demo Host & Creator User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@krishnaweddings.com" },
    update: {
      name: "Aarav Mehta",
      role: UserRole.USER,
    },
    create: {
      email: "demo@krishnaweddings.com",
      name: "Aarav Mehta",
      role: UserRole.USER,
      referral_code: "KRISHNA-HOST-2026",
    },
  });

  // Also support demo@invites.local
  await prisma.user.upsert({
    where: { email: "demo@invites.local" },
    update: { name: "Aarav Mehta" },
    create: {
      email: "demo@invites.local",
      name: "Aarav Mehta",
      role: UserRole.USER,
      referral_code: "DEMO-INVITES-2026",
    },
  });

  // 2. Demo Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@krishnaweddings.com" },
    update: {
      name: "Krishna Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
    create: {
      email: "admin@krishnaweddings.com",
      name: "Krishna Super Admin",
      role: UserRole.SUPER_ADMIN,
      referral_code: "KRISHNA-ADMIN-2026",
    },
  });

  // Also support admin@invites.local
  await prisma.user.upsert({
    where: { email: "admin@invites.local" },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      email: "admin@invites.local",
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      referral_code: "ADMIN-INVITES-2026",
    },
  });

  // 3. Creator Plan Subscription for Demo User
  const studioPlan = await prisma.creatorPlan.findFirst({
    where: { tier: CreatorPlanTier.STUDIO },
  }) || await prisma.creatorPlan.findFirst();

  if (studioPlan) {
    await prisma.userCreatorSubscription.upsert({
      where: { user_id: demoUser.id },
      update: { plan_id: studioPlan.id },
      create: {
        user_id: demoUser.id,
        plan_id: studioPlan.id,
      },
    });
  }

  // 4. Ensure Template Exists
  let template = await prisma.template.findFirst({
    where: { slug: "royal-elegance" },
  });

  if (!template) {
    template = await prisma.template.create({
      data: {
        name: "Imperial Wine & Gold",
        slug: "royal-elegance",
        description: "Opulent royal wedding invitation with sacred Ganesha invocation and Shehnai soundtrack.",
        category: TemplateCategory.LUXURY,
        event_types: ["wedding", "sangeet", "reception"],
        is_active: true,
        is_featured: true,
        preview_url: "/audio/presets/shehnai-wedding.wav",
        pricing: {
          create: [
            { duration_days: 15, price: 999 },
            { duration_days: 30, price: 1499 },
            { duration_days: 90, price: 2499 },
            { duration_days: 180, price: 3499 },
          ],
        },
      },
    });
  }

  // 5. Invitations
  // Invitation 1: Royal Palace Wedding (Active, 24 days left)
  const weddingInv = await prisma.invitation.upsert({
    where: { slug: "aarav-priya-royal-wedding" },
    update: {
      user_id: demoUser.id,
      is_published: true,
      expires_at: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      view_count: 148,
    },
    create: {
      user_id: demoUser.id,
      template_id: template.id,
      slug: "aarav-priya-royal-wedding",
      title: "Aarav & Priya • Royal Palace Wedding",
      event_type: "wedding",
      locale: "en",
      is_published: true,
      published_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      view_count: 148,
      music_url: "/audio/presets/shehnai-wedding.wav",
      data: {
        invocation: "॥ श्री गणेशाय नमः ॥",
        primaryName: "Aarav Mehta",
        secondaryName: "Priya Sharma",
        eventDate: "12 December 2026",
        eventTime: "7:00 PM Onwards",
        venueName: "The Imperial Palace Grounds",
        venueAddress: "Lake Pichola Road, Udaipur, Rajasthan",
        welcomeMessage: "Together with our families, we cordially invite you to celebrate our holy union and grace the auspicious pheras with your warm presence.",
        familyBlessings: "With best compliments from Mehta & Sharma Families",
        mapUrl: "https://maps.google.com/?q=The+Imperial+Palace+Udaipur",
        showRsvp: true,
        showMusic: true,
        showMap: true,
        showCountdown: true,
        planDays: 30,
      },
    },
  });

  // Events for Wedding
  await prisma.invitationEvent.deleteMany({ where: { invitation_id: weddingInv.id } });
  await prisma.invitationEvent.createMany({
    data: [
      {
        invitation_id: weddingInv.id,
        name: "Haldi & Mehndi Rasam",
        venue: "Mango Orchard Lawns",
        address: "Imperial Palace Grounds, Udaipur",
        date: new Date("2026-12-11T10:00:00Z"),
        start_time: "10:00 AM",
        end_time: "2:00 PM",
        sort_order: 1,
      },
      {
        invitation_id: weddingInv.id,
        name: "Royal Sangeet & Musical Night",
        venue: "Palace Courtyard & Poolside",
        address: "Imperial Palace Grounds, Udaipur",
        date: new Date("2026-12-11T19:30:00Z"),
        start_time: "7:30 PM",
        end_time: "Midnight",
        sort_order: 2,
      },
      {
        invitation_id: weddingInv.id,
        name: "Wedding Ceremony & Pheras",
        venue: "Heritage Mandap Hall",
        address: "Imperial Palace Grounds, Udaipur",
        date: new Date("2026-12-12T19:00:00Z"),
        start_time: "7:00 PM",
        end_time: "10:30 PM",
        sort_order: 3,
      },
      {
        invitation_id: weddingInv.id,
        name: "Grand Reception & Dinner",
        venue: "Crystal Ballroom",
        address: "Imperial Palace Grounds, Udaipur",
        date: new Date("2026-12-12T21:00:00Z"),
        start_time: "9:00 PM",
        sort_order: 4,
      },
    ],
  });

  // Guests for Wedding
  const guestList = [
    {
      name: "Ramesh & Sunita Sharma",
      slug: "sharma-family",
      phone: "+91 98765 43210",
      email: "sharma@example.com",
      group_name: "Groom Family",
      plus_allowed: 2,
      rsvp_status: RsvpStatus.ACCEPTED,
      rsvp_at: new Date(),
      rsvp_message: "Hearty congratulations! The whole family will be there.",
      dietary_notes: "Pure Vegetarian",
      viewed_at: new Date(),
    },
    {
      name: "Dr. Kunal Verma & Family",
      slug: "kunal-verma",
      phone: "+91 98123 45678",
      email: "verma@example.com",
      group_name: "Bride College",
      plus_allowed: 1,
      rsvp_status: RsvpStatus.PENDING,
      rsvp_at: null,
      rsvp_message: null,
      dietary_notes: null,
      viewed_at: null,
    },
    {
      name: "Anjali & Siddharth Rao",
      slug: "anjali-siddharth",
      phone: "+91 97654 32109",
      email: "siddharth@example.com",
      group_name: "Close Friends",
      plus_allowed: 0,
      rsvp_status: RsvpStatus.ACCEPTED,
      rsvp_at: new Date(),
      rsvp_message: "Ready for Sangeet dance performances!",
      dietary_notes: null,
      viewed_at: new Date(),
    },
    {
      name: "Vikram Malhotra",
      slug: "vikram-malhotra",
      phone: "+91 91234 56780",
      email: "vikram@example.com",
      group_name: "School Friends",
      plus_allowed: 0,
      rsvp_status: RsvpStatus.DECLINED,
      rsvp_at: new Date(),
      rsvp_message: "Travelling abroad for work. Sending warmest blessings!",
      dietary_notes: null,
      viewed_at: new Date(),
    },
    {
      name: "Meera & Rajesh Singhania",
      slug: "singhania-family",
      phone: "+91 98234 56789",
      email: "singhania@example.com",
      group_name: "Relatives",
      plus_allowed: 3,
      rsvp_status: RsvpStatus.ACCEPTED,
      rsvp_at: new Date(),
      rsvp_message: "Cannot wait to celebrate together!",
      dietary_notes: "Jain Food",
      viewed_at: new Date(),
    },
    {
      name: "Amit Kapoor",
      slug: "amit-kapoor",
      phone: "+91 99887 76655",
      email: "amit@example.com",
      group_name: "Work Colleague",
      plus_allowed: 1,
      rsvp_status: RsvpStatus.PENDING,
      rsvp_at: null,
      rsvp_message: null,
      dietary_notes: null,
      viewed_at: null,
    },
  ];

  for (const g of guestList) {
    await prisma.guest.upsert({
      where: { invitation_id_slug: { invitation_id: weddingInv.id, slug: g.slug } },
      update: {
        name: g.name,
        phone: g.phone,
        email: g.email,
        group_name: g.group_name,
        plus_allowed: g.plus_allowed,
        rsvp_status: g.rsvp_status,
        rsvp_message: g.rsvp_message,
        viewed_at: g.viewed_at,
      },
      create: {
        invitation_id: weddingInv.id,
        ...g,
      },
    });
  }

  // Invitation 2: Birthday Celebration
  await prisma.invitation.upsert({
    where: { slug: "vivaan-first-birthday" },
    update: { user_id: demoUser.id },
    create: {
      user_id: demoUser.id,
      template_id: template.id,
      slug: "vivaan-first-birthday",
      title: "Vivaan's 1st Birthday • Jungle Safari Party",
      event_type: "birthday",
      locale: "en",
      is_published: true,
      published_at: new Date(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      view_count: 56,
      data: {
        invocation: "🎈 Happy 1st Birthday Vivaan! 🦁",
        primaryName: "Vivaan Mehta",
        eventDate: "28 November 2026",
        eventTime: "5:00 PM Onwards",
        venueName: "Fun Safari Clubhouse, Mumbai",
        venueAddress: "Juhu Tara Road, Mumbai",
        welcomeMessage: "Join us for cakes, games, and animal adventures as our little prince turns One!",
        showRsvp: true,
        planDays: 15,
      },
    },
  });

  // Invitation 3: Griha Pravesh & Housewarming
  await prisma.invitation.upsert({
    where: { slug: "sharma-griha-pravesh" },
    update: { user_id: demoUser.id },
    create: {
      user_id: demoUser.id,
      template_id: template.id,
      slug: "sharma-griha-pravesh",
      title: "Sharma Family Griha Pravesh & Vastu Pooja",
      event_type: "housewarming",
      locale: "en",
      is_published: true,
      published_at: new Date(),
      expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      view_count: 82,
      data: {
        invocation: "॥ ॐ नमो भगवते वासुदेवाय ॥",
        primaryName: "Sharma Family",
        eventDate: "5 December 2026",
        eventTime: "9:00 AM Pooja • 1:00 PM Lunch",
        venueName: "Villa 108, Palm Meadows, Bangalore",
        venueAddress: "Whitefield Road, Bangalore",
        welcomeMessage: "We seek your gracious presence and blessings as we enter our new abode.",
        showRsvp: true,
        planDays: 30,
      },
    },
  });

  // 6. Creator Marketplace Templates & Sales
  const creatorTemplate = await prisma.template.upsert({
    where: { slug: "royal-velvet-gold-creator" },
    update: {
      owner_user_id: demoUser.id,
      is_in_marketplace: true,
      price: 1499,
      sales_count: 18,
      revenue_total: 26982,
    },
    create: {
      name: "Royal Velvet & Amber Gold (Creator Edition)",
      slug: "royal-velvet-gold-creator",
      description: "Handcrafted luxury template with gold foil effects and shehnai melodies.",
      category: TemplateCategory.LUXURY,
      event_types: ["wedding", "reception"],
      owner_user_id: demoUser.id,
      is_in_marketplace: true,
      price: 1499,
      sales_count: 18,
      revenue_total: 26982,
      moderation_status: "APPROVED",
      is_active: true,
      sort_order: 1,
    },
  });

  // Creator Sales records
  const sampleBuyers = [
    { name: "Rahul Deshmukh", email: "rahul.d@example.com", amount: 1499 },
    { name: "Pooja Singhal", email: "pooja.s@example.com", amount: 1499 },
    { name: "Sanjay Reddy", email: "sanjay.r@example.com", amount: 2499 },
    { name: "Kavita Nair", email: "kavita.n@example.com", amount: 999 },
  ];

  for (let i = 0; i < sampleBuyers.length; i++) {
    const b = sampleBuyers[i];
    const buyerUser = await prisma.user.upsert({
      where: { email: b.email },
      update: { name: b.name },
      create: {
        email: b.email,
        name: b.name,
        referral_code: `BUYER-${i + 1}-${Date.now()}`,
      },
    });

    const sellerShare = Math.round(b.amount * 0.9);
    const platformShare = b.amount - sellerShare;

    await prisma.templatePurchase.create({
      data: {
        template_id: creatorTemplate.id,
        buyer_user_id: buyerUser.id,
        gross_amount: b.amount,
        platform_fee: platformShare,
        seller_amount: sellerShare,
      },
    });
  }

  // 7. Active Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: { is_active: true, value: 10 },
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      is_active: true,
      max_uses: 500,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FESTIVE20" },
    update: { is_active: true, value: 20 },
    create: {
      code: "FESTIVE20",
      type: "PERCENTAGE",
      value: 20,
      is_active: true,
      max_uses: 200,
    },
  });

  console.log("Demo data seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
