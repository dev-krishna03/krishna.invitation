import { PrismaClient, Gateway, PaymentStatus } from "@prisma/client";
import { generateReferralCode } from "../src/lib/referral";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@invites.local" },
    update: {},
    create: {
      email: "demo@invites.local",
      name: "Demo User",
      referral_code: generateReferralCode(),
    },
  });

  const template = await prisma.template.findUnique({ where: { slug: "royal-elegance" } });
  if (!template) throw new Error("template missing");

  const inv = await prisma.invitation.upsert({
    where: { slug: "aarav-priya-demo" },
    update: {},
    create: {
      user_id: user.id,
      template_id: template.id,
      slug: "aarav-priya-demo",
      title: "Aarav + Priya",
      event_type: "wedding",
      locale: "en",
      is_published: true,
      published_at: new Date(),
      data: {
        primaryName: "Aarav Mehta",
        secondaryName: "Priya Sharma",
        hashtag: "#AaravAndPriya",
        message: "With the blessings of our families, please join us.",
        theme: "#8b1e3f",
        family: ["Mr. & Mrs. Mehta", "Mr. & Mrs. Sharma"],
      },
    },
  });

  await prisma.invitationEvent.deleteMany({ where: { invitation_id: inv.id } });
  await prisma.invitationEvent.createMany({
    data: [
      { invitation_id: inv.id, name: "Haldi", venue: "Mehta Residence", address: "Udaipur", date: new Date("2026-12-14"), start_time: "11:00", sort_order: 0 },
      { invitation_id: inv.id, name: "Sangeet", venue: "The Oberoi", address: "Udaipur", date: new Date("2026-12-15"), start_time: "19:00", sort_order: 1 },
      { invitation_id: inv.id, name: "Wedding", venue: "City Palace Lawns", address: "Udaipur", date: new Date("2026-12-16"), start_time: "18:30", sort_order: 2 },
    ],
  });

  const guests = [
    { name: "Rohan Gupta", slug: "rohan-gupta-abcd", email: "rohan@example.com" },
    { name: "Ananya Iyer", slug: "ananya-iyer-efgh", email: "ananya@example.com" },
    { name: "Vikram Shah", slug: "vikram-shah-ijkl", email: "vikram@example.com" },
  ];
  for (const g of guests) {
    await prisma.guest.upsert({
      where: { invitation_id_slug: { invitation_id: inv.id, slug: g.slug } },
      update: {},
      create: { invitation_id: inv.id, ...g, plus_allowed: 1 },
    });
  }

  // A sample successful payment.
  await prisma.payment.create({
    data: {
      user_id: user.id,
      invitation_id: inv.id,
      gateway: Gateway.RAZORPAY,
      gateway_order_id: "order_test_123",
      gateway_payment_id: "pay_test_123",
      amount: 999,
      status: PaymentStatus.SUCCESS,
    },
  });

  // Coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENTAGE", value: 10, is_active: true, max_uses: 100 },
  });

  console.log("Extra demo data loaded.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
