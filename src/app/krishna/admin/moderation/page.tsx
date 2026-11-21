import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";
import { ModerationRow } from "./ModerationRow";
import type { Currency } from "@/lib/currency";

export default async function ModerationPage() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.template.findMany({
      where: { moderation_status: "PENDING" },
      include: { owner: { select: { email: true, name: true } } },
      orderBy: { submitted_at: "asc" },
    }),
    prisma.template.findMany({
      where: { moderation_status: "APPROVED" },
      include: { owner: { select: { email: true, name: true } } },
      orderBy: { reviewed_at: "desc" },
      take: 20,
    }),
    prisma.template.findMany({
      where: { moderation_status: { in: ["REJECTED", "TAKEN_DOWN"] } },
      include: { owner: { select: { email: true, name: true } }, reviewed_by: { select: { email: true } } },
      orderBy: { reviewed_at: "desc" },
      take: 20,
    }),
  ]);

  return (
    <main className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Template Moderation</h1>
        <p className="mt-1 text-sm text-stone-600">
          Approve, reject, or take down user-submitted marketplace templates.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Pending review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
            Nothing to review right now.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((t) => (
              <ModerationRow
                key={t.id}
                template={{
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                  description: t.description,
                  owner_email: t.owner?.email ?? "",
                  owner_name: t.owner?.name ?? null,
                  price_display: formatPrice(t.price, t.currency as Currency),
                  usd_display: t.price_usd ? formatPrice(t.price_usd, "USD") : null,
                  submitted_at: t.submitted_at?.toISOString() ?? null,
                  moderation_notes: t.moderation_notes,
                  moderation_status: t.moderation_status,
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Recently approved
        </h2>
        <ul className="mt-3 divide-y rounded-xl border border-stone-200 bg-white text-sm">
          {approved.length === 0 ? (
            <li className="p-4 text-xs text-stone-500">No approvals yet.</li>
          ) : (
            approved.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {t.owner?.name ?? t.owner?.email} · {formatPrice(t.price, t.currency as Currency)}
                  </p>
                </div>
                <span className="text-[11px] text-emerald-700">Approved {t.reviewed_at?.toISOString().slice(0, 10)}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          Rejected / Taken down
        </h2>
        <ul className="mt-3 divide-y rounded-xl border border-stone-200 bg-white text-sm">
          {rejected.length === 0 ? (
            <li className="p-4 text-xs text-stone-500">Nothing rejected.</li>
          ) : (
            rejected.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {t.owner?.name ?? t.owner?.email} — {t.moderation_status}
                    {t.moderation_notes ? ` · ${t.moderation_notes}` : ""}
                  </p>
                </div>
                <span className="text-[11px] text-rose-700">{t.reviewed_at?.toISOString().slice(0, 10)}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
