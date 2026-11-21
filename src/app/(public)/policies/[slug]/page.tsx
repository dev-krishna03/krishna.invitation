import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = await prisma.policy.findUnique({ where: { slug } });
  if (!policy || !policy.is_published) notFound();

  const otherPolicies = await prisma.policy.findMany({
    where: { is_published: true, NOT: { slug } },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <nav className="text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <span className="mx-1 text-stone-300">/</span>
        <Link href="/policies" className="hover:text-stone-900">Policies</Link>
        <span className="mx-1 text-stone-300">/</span>
        <span>{policy.title}</span>
      </nav>

      <header className="mt-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">{policy.title}</h1>
        {policy.summary && <p className="mt-2 text-sm text-stone-600">{policy.summary}</p>}
        <p className="mt-2 text-xs text-stone-400">
          v{policy.version} · effective {policy.effective_at.toISOString().slice(0, 10)}
        </p>
      </header>

      {/* The content is editor-authored Markdown. Render as plain prose with
          lightweight paragraph breaks — no external Markdown lib pulled in. */}
      <article className="prose prose-stone mt-8 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
        {policy.content}
      </article>

      {otherPolicies.length > 0 && (
        <aside className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Related</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {otherPolicies.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/policies/${p.slug}`}
                  className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}
