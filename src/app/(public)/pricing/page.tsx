import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
  const [templates, plans] = await Promise.all([
    prisma.template.findMany({
      where: { is_active: true },
      include: { pricing: { where: { is_active: true }, orderBy: { duration_days: "asc" } } },
      orderBy: { sort_order: "asc" },
    }),
    prisma.subscriptionPlan.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <p className="mt-2 text-gray-600">Pay once per invitation, or subscribe as a company.</p>

      <h2 className="mt-10 text-xl font-semibold">Individual</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl border p-5">
            <h3 className="font-semibold">{t.name}</h3>
            <ul className="mt-4 space-y-1 text-sm">
              {t.pricing.map((p) => (
                <li key={p.duration_days} className="flex justify-between border-b py-1">
                  <span>{p.duration_days} days</span>
                  <span>₹{p.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Company</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {plans.filter((p) => p.type === "COMPANY").map((p) => (
          <div key={p.id} className="rounded-xl border p-5">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-2 text-3xl">₹{p.price.toLocaleString()}<span className="text-sm text-gray-500"> / {p.billing_period.toLowerCase()}</span></p>
            <ul className="mt-4 space-y-1 text-sm">
              <li>Members: {p.max_members ?? "∞"}</li>
              <li>Invitations: {p.max_invitations ?? "∞"}</li>
              {Array.isArray(p.features) && (p.features as string[]).map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <details className="mt-4 rounded border p-4">
          <summary>Which event types are supported?</summary>
          <p className="mt-2 text-sm">
            Wedding, engagement, birthday, baby shower, Gruh Vastu, anniversary, Namkaran, Mundan, Haldi,
            Mehndi, Sangeet, reception, pooja, festival, corporate, and more.
          </p>
        </details>
        <details className="mt-2 rounded border p-4">
          <summary>Which languages?</summary>
          <p className="mt-2 text-sm">
            English, Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi,
            Urdu, Spanish, French, Arabic.
          </p>
        </details>
      </section>
    </main>
  );
}
