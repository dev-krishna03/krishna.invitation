import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplate } from "@/templates/registry";

export default async function TryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tpl = getTemplate(slug);
  if (!tpl) notFound();
  const { Component, preview } = tpl;

  return (
    <div>
      <Component data={preview} isDemo isPreview />
      <div className="sticky bottom-0 border-t bg-white/90 p-4 text-center backdrop-blur">
        <Link
          href={`/dashboard/create?template=${slug}`}
          className="inline-block rounded-md bg-black px-5 py-2 text-white"
        >
          Create Your Own
        </Link>
      </div>
    </div>
  );
}
