import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding advanced host & creator operations data...");

  // 1. WhatsApp Contexts (Health & Backup Failover)
  await prisma.whatsAppContext.upsert({
    where: { phone_number_id: "phone_primary_919825012345" },
    update: {},
    create: {
      phone_number_id: "phone_primary_919825012345",
      display_phone_number: "+91 98250 12345",
      quality_rating: "GREEN",
      status: "CONNECTED",
      daily_limit: 10000,
      sent_today: 432,
      block_rate: 0.01,
      is_primary: true,
      last_health_check: new Date(),
    },
  });

  await prisma.whatsAppContext.upsert({
    where: { phone_number_id: "phone_backup_919825067890" },
    update: {},
    create: {
      phone_number_id: "phone_backup_919825067890",
      display_phone_number: "+91 98250 67890",
      quality_rating: "GREEN",
      status: "STANDBY",
      daily_limit: 5000,
      sent_today: 0,
      block_rate: 0.0,
      is_primary: false,
      last_health_check: new Date(),
    },
  });

  // 2. Daily Reconciliations (Gateway vs Orders vs Creator payouts)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.dailyReconciliation.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      total_orders: 14,
      gross_sales: 24500,
      gateway_settled: 24010, // after 2% pg fee
      creator_payouts: 18900, // 90% net creator pool
      platform_fee_net: 5110,
      discrepancy: 0,
      status: "MATCHED",
      notes: "Razorpay batch settlement #RZP-20261123-A confirmed.",
    },
  });

  await prisma.dailyReconciliation.upsert({
    where: { date: yesterday },
    update: {},
    create: {
      date: yesterday,
      total_orders: 28,
      gross_sales: 46800,
      gateway_settled: 45864,
      creator_payouts: 36200,
      platform_fee_net: 9664,
      discrepancy: 0,
      status: "MATCHED",
      notes: "Cashfree auto-reconciliation complete with 0 chargebacks.",
    },
  });

  // 3. Find demo user & creator user
  const hostUser = await prisma.user.findFirst({
    where: { email: { contains: "demo" } },
  });

  const creatorUser = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  const sampleTemplate = await prisma.template.findFirst();

  if (hostUser && creatorUser) {
    // 4. Custom Design Requests & Bids
    const existingReq = await prisma.customDesignRequest.findFirst({
      where: { host_user_id: hostUser.id },
    });

    if (!existingReq) {
      const req = await prisma.customDesignRequest.create({
        data: {
          host_user_id: hostUser.id,
          title: "Royal Gujarati & English Wedding Suite with Heritage Motifs",
          event_type: "wedding",
          description:
            "Need a complete 5-event suite (Haldi, Mehendi, Sangeet, Vedic Vivah, Reception) with custom Gujarati calligraphy font (Noto Sans Gujarati), background shehnai audio, and guest-scoped function visibility.",
          budget: 3500,
          currency: "INR",
          status: "OPEN",
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.designBid.create({
        data: {
          request_id: req.id,
          creator_user_id: creatorUser.id,
          amount: 3200,
          proposal:
            "Namaste! I specialize in royal heritage Rajasthani & Gujarati luxury invitations with verified audio sync, custom map pin integration, and family grouping.",
          sample_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
          delivery_days: 2,
          status: "PENDING",
        },
      });
    }

    // 5. Done-for-You Concierge Orders
    const existingConcierge = await prisma.conciergeServiceOrder.findFirst({
      where: { user_id: hostUser.id },
    });

    if (!existingConcierge) {
      await prisma.conciergeServiceOrder.create({
        data: {
          user_id: hostUser.id,
          status: "IN_PROGRESS",
          assigned_to: "Priya Patel (Senior Wedding Stylist)",
          notes:
            "Host provided details via WhatsApp. Customizing photo wall and configuring UPI QR for digital shagun.",
          amount: 999,
        },
      });
    }

    // 6. Affiliate Partner & Referral
    await prisma.affiliatePartner.upsert({
      where: { user_id: creatorUser.id },
      update: {},
      create: {
        user_id: creatorUser.id,
        code: "MOMENTS_STUDIO",
        company_name: "Moments Photography & Films",
        category: "PHOTOGRAPHER",
        commission_pct: 12,
        total_earned: 4800,
        total_paid: 3200,
        status: "ACTIVE",
      },
    });

    // 7. Copyright Reports & Creator Strikes
    if (sampleTemplate) {
      const existingReport = await prisma.copyrightReport.findFirst({
        where: { template_id: sampleTemplate.id },
      });

      if (!existingReport) {
        await prisma.copyrightReport.create({
          data: {
            template_id: sampleTemplate.id,
            reporter_name: "Rajesh Sharma Designs",
            reporter_email: "rajesh@sharmadesigns.in",
            proof_url: "https://copyright.gov.in/reg/2025/112948",
            description: "Sample border vector pattern resembles our trademarked Pichwai motif collection.",
            status: "PENDING",
            action_taken: "Under review by Super Admin.",
          },
        });
      }

      // 8. Template Reviews
      const existingReview = await prisma.templateReview.findFirst({
        where: { template_id: sampleTemplate.id, user_id: hostUser.id },
      });

      if (!existingReview) {
        await prisma.templateReview.create({
          data: {
            template_id: sampleTemplate.id,
            user_id: hostUser.id,
            rating: 5,
            review:
              "Absolutely breathtaking design! All 400 of our guests complimented the music and Google Maps 1-tap navigation on WhatsApp.",
            verified_buyer: true,
            is_featured: true,
          },
        });
      }
    }

    // 9. Attach Multi-Event functions & Photo/Wish Wall to existing invitation
    const invitation = await prisma.invitation.findFirst({
      where: { user_id: hostUser.id },
      include: { events: true },
    });

    if (invitation) {
      // Update invitation with bundle and gift settings
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          bundle_enabled: true,
          bundle_type: "FULL_SUITE",
          bundle_stage: "MAIN",
          gift_upi_id: "aaravpriya@okhdfcbank",
          gift_notes: "Your presence and blessings are our greatest gift. Should you wish to send digital shagun:",
          wish_wall_enabled: true,
          photo_wall_enabled: true,
          is_protected: true,
          supported_locales: ["en", "gu", "hi"],
          font_family: "noto-sans-gujarati",
        },
      });

      // Seed multi-events if none exist
      if (invitation.events.length === 0) {
        await prisma.invitationEvent.createMany({
          data: [
            {
              invitation_id: invitation.id,
              name: "Ganesh Sthapana & Mandap Muhurat",
              venue: "Mehta House Courtyard, Ahmedabad",
              date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              start_time: "09:30 AM",
              end_time: "12:00 PM",
              sort_order: 1,
            },
            {
              invitation_id: invitation.id,
              name: "Mehendi & Sangeet Night",
              venue: "The Heritage Lawn, Club O7, Ahmedabad",
              date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
              start_time: "06:00 PM",
              end_time: "11:00 PM",
              sort_order: 2,
            },
            {
              invitation_id: invitation.id,
              name: "Vedic Vivah (Pheras)",
              venue: "Grand Ballroom, The Leela Palace, Udaipur",
              date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
              start_time: "05:00 PM",
              end_time: "09:00 PM",
              sort_order: 3,
            },
            {
              invitation_id: invitation.id,
              name: "Royal Reception Dinner",
              venue: "Poolside Gardens, The Leela Palace, Udaipur",
              date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
              start_time: "07:30 PM",
              end_time: "11:30 PM",
              sort_order: 4,
            },
          ],
        });
      }

      // Seed wishes & blessings
      const existingWish = await prisma.guestWish.findFirst({
        where: { invitation_id: invitation.id },
      });

      if (!existingWish) {
        await prisma.guestWish.createMany({
          data: [
            {
              invitation_id: invitation.id,
              author_name: "Kishorebhai & Kokilaben Patel",
              message:
                "Heartiest congratulations to both families! May Lord Krishna shower eternal happiness and prosperous married life on Aarav & Priya.",
              is_approved: true,
              is_flagged: false,
            },
            {
              invitation_id: invitation.id,
              author_name: "Sneha & Rohan Desai",
              message:
                "So excited for the Sangeet night! Counting down the days to celebrate with you all.",
              photo_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
              is_approved: true,
              is_flagged: false,
            },
          ],
        });
      }

      // Update sample guests with multi-event scoping, dietary, family group
      const guests = await prisma.guest.findMany({
        where: { invitation_id: invitation.id },
        take: 3,
      });

      if (guests.length > 0) {
        await prisma.guest.update({
          where: { id: guests[0].id },
          data: {
            meal_preference: "Jain",
            is_family: true,
            family_members: ["Mr. Ramesh Shah", "Mrs. Jayshree Shah", "Master Kevin Shah"],
            plus_count: 2,
            travel_details: {
              arrival_mode: "Flight (6E-542)",
              arrival_date: "11 Dec 2026",
              hotel_assigned: "Heritage Deluxe Room 304",
            },
          },
        });
      }
    }
  }

  console.log("Advanced features data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
