# Invitation Platform

Multi-tenant SaaS for creating and selling digital invitations across every
occasion — wedding, engagement, birthday, baby shower, Gruh Vastu, anniversary,
Namkaran, Mundan, Haldi, Mehndi, Sangeet, reception, corporate, pooja, festival
and more. Each user gets a creator workspace where they design templates, set
their own prices (INR + USD), and sell them in a moderated community marketplace.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS, Turbopack)
- Supabase Auth + Postgres + Global CDN Storage
- Prisma 6 ORM
- Meta WhatsApp Business Cloud API (Graph API v21.0) & Webhooks
- Google Maps Platform & Places API
- Framer Motion + Lucide icons
- Payment gateway abstraction: Centralized Razorpay, Cashfree, PhonePe, Stripe
- Brevo for transactional email (configured in Super Admin → Integrations)
- AES-256-GCM encryption for all third-party credentials at rest

## Setup

```bash
cp .env.example .env.local
```

```bash
openssl rand -base64 32   # value for CREDENTIALS_ENCRYPTION_KEY
```

```bash
npx prisma db push && npx prisma generate && npx prisma db seed && npm run dev
```

The seed creates: platform templates, subscription plans, payment gateways,
integrations, site settings, 3 creator plans (Free / Pro / Studio), and the
5 default policies. It also upserts a Super Admin row bound to
`admin@invites.local`.

## Super Admin

Hidden entry: **`/krishna`** + code **`123456`** (override with
`ADMIN_ACCESS_CODE`). Signs a short-lived HMAC cookie that unlocks
`/krishna/admin/*` for 8 hours.

| Admin page | What it controls |
|------------|------------------|
| `/krishna/admin` | Dashboard — users, active invitations, revenue, companies |
| `/krishna/admin/templates` | All templates on the platform |
| `/krishna/admin/moderation` | Pending user-submitted templates — Approve / Reject with notes |
| `/krishna/admin/event-types` | Occasions tree (parent + sub-occasions, icons) |
| `/krishna/admin/users` | All users, roles |
| `/krishna/admin/organizations` | All companies, plan, status |
| `/krishna/admin/plans` | SaaS subscription plans (Individual / Company) |
| `/krishna/admin/creator-plans` | Creator plan tiers — name, price, platform fee %, limits, features |
| `/krishna/admin/creator-economy` | Creator economy & payouts hub — Bank & UPI settlements, platform fee cut |
| `/krishna/admin/payouts` | Centralized Razorpay collection & creator payout disbursements |
| `/krishna/admin/elements` | Global Canva-style element catalog (SVG, PNG, JPG, MP4, MP3, WAV) |
| `/krishna/admin/policies` | TOS, Privacy, Refund, Acceptable Use, Creator Agreement |
| `/krishna/admin/gateways` | Razorpay / Cashfree / PhonePe / Stripe credentials + active gateway |
| `/krishna/admin/integrations` | Meta WhatsApp Cloud API, Brevo, Supabase Storage, Google Maps |
| `/krishna/admin/trust-safety` | Copyright reports, moderation quarantine, creator strikes |
| `/krishna/admin/operations` | System health, database connection, storage buckets, webhook status |
| `/krishna/admin/event-bundles` | Event bundles & multi-ceremony package management |
| `/krishna/admin/coupons` | Discount codes & advanced user/date rules |
| `/krishna/admin/payments` | All payments, refunds |
| `/krishna/admin/settings` | Site name, support email, currencies, USD→INR FX rate |
| `/krishna/admin/audit-log` | Every mutation audit-logged |

The admin UI uses a **white base** (stone-50) with brand-accent rose/amber
highlights on active nav + CTAs.

## Creator workspace

Each user automatically gets a workspace with the Free tier.

| User route | Purpose |
|------------|---------|
| `/dashboard/workspace` | Studio identity, avatar photo, wallet, bank/UPI payout profile, coupons |
| `/dashboard` | Flow overview + My Invitations + Concierge service booking |
| `/dashboard/custom-requests` | Bespoke client design requests & creator proposals |
| `/dashboard/create` | Create wizard — pick template → tier → details → pay |
| `/dashboard/templates` | My templates — inline price editor + marketplace toggle |
| `/dashboard/templates/new` | New template: blank / import community / from invitation |
| `/dashboard/templates/[id]/edit` | Metadata + view image (4:5 preview) + INR+USD pricing + moderation |
| `/dashboard/library` | Downloaded + Created lists |
| `/dashboard/plan` | Free Hobbyist · Creator Pro · Studio Elite |
| `/dashboard/invitations/[id]/share` | Preview → Approval → User cap → Pay → Share Access, or Direct Share |
| `/community` | Marketplace — only APPROVED user templates visible |
| `/community/[slug]` | Buy a community template (copies into buyer's workspace) |

### Creator plans

| Tier | Price | Platform fee | Templates for sale | Live invitations | White-label |
|------|-------|--------------|--------------------|------------------|-------------|
| Free Hobbyist | ₹0 | 30% | 0 (can't sell) | 1 | — |
| Creator Pro | ₹4,999 / yr | 20% | 10 | 10 | — |
| Studio Elite | ₹19,999 / yr | 10% | Unlimited | Unlimited | ✓ |

Fee is read from the seller's plan at sale time; each sale writes a
`TemplatePurchase` row with `gross / platform_fee / seller_amount` and
rolls up `sales_count` + `revenue_total` on the source template.

## Pricing & currency

- Every price is stored in both **INR** (`price`) and **USD** (`price_usd`);
  either can be left blank and the missing one converts from the platform
  `usd_to_inr` FX rate (SiteSetting, admin-editable).
- `src/lib/currency.ts` holds `formatPrice`, `currencySymbol`, `convertPrice`
  and `templatePriceFor` — every surface routes through it so **₹ renders with
  Indian grouping** (₹1,23,456) and **$ with US grouping** ($123,456).
- Users have `preferred_currency` (defaults to INR).

## Public site

`/`, `/gallery`, `/try/:slug`, `/invite/:slug`, `/invite/:slug/:guestSlug`,
`/pricing`, `/contact`, `/about`, `/community`, `/community/[slug]`,
`/policies`, `/policies/[slug]`.

All five policies are editable from Super Admin → Policies with versioning
and a Published toggle.

## Secrets strategy

The only secret in env is `CREDENTIALS_ENCRYPTION_KEY`. Every third-party
credential (Razorpay, Stripe, Cashfree, PhonePe, Brevo API key, Google Maps
key) is stored **encrypted in Postgres** and managed from Super Admin. Rotate
by editing the integration row in the panel.

## Deployment

- Vercel for Next.js hosting
- Supabase for DB + Auth + Storage
- Set up RLS policies in Supabase for multi-tenant isolation
- Configure webhook URLs in each gateway dashboard pointing to
  `https://<host>/api/webhooks/{razorpay|cashfree|phonepe|stripe}`
- Rotate `ADMIN_ACCESS_CODE` for prod and set `CREDENTIALS_ENCRYPTION_KEY` from
  `openssl rand -base64 32`.
