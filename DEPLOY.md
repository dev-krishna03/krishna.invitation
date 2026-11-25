# Deploying the demo to Vercel

This gets a working demo URL in ~10 minutes with dummy data. Super Admin
works out of the box via the `/krishna` + `123456` gate — no Supabase user
required for the admin panel. Supabase is only needed if you want end-user
signup/login to work; without it, the public site + admin still function
with the seeded demo data.

## 1. Hosted Postgres (pick one — free tiers below)

### Neon (recommended, fastest)
1. Sign up at https://neon.tech
2. Create a project → copy the **pooled connection string**
3. That's your `DATABASE_URL`

### Supabase (gets you auth too)
1. Create a project at https://supabase.com
2. Settings → Database → copy the **Transaction mode** URL
3. Append `?pgbouncer=true&connection_limit=1`
4. From Settings → API: copy `URL` and `anon public` key → those are
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Vercel Postgres
1. In the Vercel dashboard → Storage → Create database → Postgres
2. Pick the project; Vercel will auto-set `POSTGRES_URL`. Alias it as
   `DATABASE_URL` under Settings → Environment Variables.

## 2. Push the schema + seed dummy data (run locally once)

```bash
export DATABASE_URL="postgresql://..."
```

```bash
npx prisma db push
```

```bash
npx prisma db seed
```

The seed loads: platform templates, 3 creator plans, 17 editor elements,
5 policies, 4 payment gateways (inactive), 3 integrations, site settings,
and a Super Admin row for `admin@invites.local`.

Add demo marketplace data:

```bash
npx tsx prisma/extra-seed.ts
```

Loads a demo user, a published demo invitation (`aarav-priya-demo`), a few
guests and a successful payment so the Super Admin dashboard isn't empty.

## 3. Deploy to Vercel

```bash
vercel link
```

```bash
vercel env add DATABASE_URL production
```

```bash
vercel env add CREDENTIALS_ENCRYPTION_KEY production
# paste: $(openssl rand -base64 32)
```

Supabase is optional — only add if you want user sign-up / login to work:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Also set the public app URL so emails, QR codes and OpenGraph tags
use the real host:

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# paste your Vercel URL, e.g. https://invitation.vercel.app
```

Deploy:

```bash
vercel --prod
```

## 4. What you get on the demo URL

| Path | Needs auth? | What to try |
|------|-------------|-------------|
| `/` | No | Landing with animated hero + occasion grid + featured designs |
| `/gallery` | No | Template cards |
| `/try/[slug]` | No | Live demo of a template |
| `/invite/aarav-priya-demo` | No | Published invitation with envelope-open, events, map, RSVP |
| `/pricing` | No | Individual tiers + company plan |
| `/community` | No | Marketplace with "Sunset Royal · ₹799" (demo) |
| `/community/[slug]` | No | Buy page with price + fee breakdown |
| `/policies` | No | Terms / Privacy / Refund / Acceptable Use / Creator Agreement |
| `/policies/[slug]` | No | Individual policy render |
| `/krishna` | Code: `123456` | Admin gate — OTP-style box, unlocks admin for 8h |
| `/krishna/admin/*` | Admin cookie | All 20 admin sections |
| `/dashboard/*` | Supabase user | Creator workspace (needs step 3 Supabase envs) |

## 5. Rotate secrets before public launch

- Change `ADMIN_ACCESS_CODE` (set it in Vercel env; default is `123456`)
- Generate a fresh `CREDENTIALS_ENCRYPTION_KEY` for production
- Add real payment-gateway credentials from Super Admin → Payment Gateways
- Add Brevo API key from Super Admin → Integrations

## 6. Build-time notes

- `prisma generate` runs on `postinstall` and in `build`, so the Prisma
  client is always fresh on Vercel.
- `vercel.json` pins the region to `bom1` (Mumbai) and bumps Node heap
  for the Next build.
- `.env` is gitignored; set every variable through Vercel's dashboard.
