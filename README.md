# Invitation Platform

Multi-tenant SaaS for creating and sharing digital invitations across every
occasion — wedding, engagement, birthday, baby shower, Gruh Vastu, anniversary,
Namkaran, Mundan, Haldi, Mehndi, Sangeet, reception, corporate, pooja, festival,
and more — with 14 languages, RTL support, a referral program, and per-template
pricing or company subscriptions.

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind v4, Turbopack)
- Supabase Auth + Postgres + Storage
- Prisma 6 ORM
- next-intl (14 locales: en, hi, gu, mr, ta, te, kn, ml, bn, pa, ur, es, fr, ar)
- Payment gateway abstraction: Razorpay, Cashfree, PhonePe, Stripe
- Brevo for transactional email (configured in `/admin/integrations`)
- Credential encryption: AES-256-GCM

## Setup

```bash
cp .env.example .env.local      # fill in Supabase + DATABASE_URL + encryption key
openssl rand -base64 32          # value for CREDENTIALS_ENCRYPTION_KEY
npx prisma db push               # push schema to Supabase Postgres
npx prisma generate              # generate client
npx prisma db seed               # seed templates, plans, gateways, integrations, settings, super admin row
npm run dev
```

Create your super-admin in Supabase Auth with email `admin@invites.local` — the
seed binds this email to the SUPER_ADMIN row. For a different email, update the
seed before running it.

## Phases shipped in this repo

| # | Phase | Key files |
|---|-------|-----------|
| 1 | Next.js + Supabase + auth | `src/lib/supabase/*`, `src/app/(auth)/*`, `src/app/api/auth/*` |
| 2 | Prisma schema (15 models + enums) + seed | `prisma/schema.prisma`, `prisma/seed.ts` |
| 3 | Payment abstraction + 4 providers + webhooks | `src/lib/payments/*`, `src/app/api/webhooks/[gateway]/route.ts` |
| 4 | Template engine + public gallery / try / invite | `src/templates/*`, `src/app/(public)/*` |
| 5 | Super Admin (11 pages + APIs + audit log) | `src/app/admin/*`, `src/app/api/admin/*` |
| 6 | User dashboard + create wizard + invitations API | `src/app/dashboard/*`, `src/app/api/invitations/*` |
| 7 | Company dashboard + org API | `src/app/company/*`, `src/app/api/org/*` |
| 8 | Brevo email + template mapping via SiteSetting | `src/lib/email.ts`, `src/lib/email-templates.ts` |
| 9 | Landing, pricing, contact, about, RSVP, sitemap, robots | `src/app/page.tsx`, `src/app/(public)/pricing/*`, etc. |
| 10 | Credential encryption, rate-limit, error boundaries | `src/lib/crypto.ts`, `src/lib/rate-limit.ts`, `src/app/error.tsx` |

## URL map

Public: `/`, `/gallery`, `/try/:slug`, `/invite/:slug`, `/invite/:slug/:guestSlug`, `/pricing`, `/contact`, `/about`
Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`
User: `/dashboard`, `/dashboard/create`, `/dashboard/invitations/:id`, `/dashboard/analytics`, `/dashboard/settings`
Company: `/company`, `/company/invitations`, `/company/team`, `/company/subscription`, `/company/settings`
Super admin: `/admin`, `/admin/templates|users|organizations|plans|gateways|integrations|coupons|payments|settings|audit-log`
Webhooks: `/api/webhooks/razorpay|cashfree|phonepe|stripe`

## Secrets strategy

The only secret in env is `CREDENTIALS_ENCRYPTION_KEY`. All other provider
credentials — Razorpay keys, Stripe keys, Brevo API key, Google Maps key — are
stored encrypted in Postgres through `/admin/gateways` and `/admin/integrations`.
AES-256-GCM via `lib/crypto.ts`.

## Deployment

- Vercel for Next.js hosting
- Supabase for DB + Auth + Storage
- Set up RLS policies in Supabase for multi-tenant isolation
- Configure webhook URLs in each gateway dashboard pointing to
  `https://<host>/api/webhooks/{razorpay|cashfree|phonepe|stripe}`
