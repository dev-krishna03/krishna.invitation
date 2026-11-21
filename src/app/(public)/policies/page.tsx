import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Scale, ArrowRight } from "lucide-react";

export default async function PoliciesIndex() {
  const policies = await prisma.policy.findMany({
    where: { is_published: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-stone-700">
          <Scale className="h-3 w-3" />
          Legal & Policies
        </div>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-stone-900">Our policies</h1>
        <p className="mt-2 text-sm text-stone-600">
          Everything about using the platform — written in plain English and kept up to date.
        </p>
      </div>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {policies.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/policies/${p.slug}`}
              className="group block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="font-serif text-lg font-bold text-stone-900">{p.title}</h3>
              {p.summary && <p className="mt-1 text-xs text-stone-600">{p.summary}</p>}
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                Read
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
