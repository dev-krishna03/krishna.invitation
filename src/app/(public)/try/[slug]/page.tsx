import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/templates/registry";
import { InteractiveTemplatePreview } from "@/components/preview/InteractiveTemplatePreview";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const dbTpl = await prisma.template.findUnique({ where: { slug } });
  return {
    title: `Preview ${dbTpl?.name ?? "Invitation"} • Krishna Invitations`,
    description: "Interactive guest invitation preview with musical ambiance and WhatsApp RSVPs.",
  };
}

export default async function TryPage({ params }: { params: Params }) {
  const { slug } = await params;

  // Check database first
  const dbTpl = await prisma.template.findUnique({ where: { slug } });
  const tpl = getTemplate(slug);

  if (!dbTpl && !tpl) notFound();

  const templateName = dbTpl?.name ?? (slug === "royal-elegance" ? "Royal Elegance" : "Minimal Love");
  const songUrl = dbTpl?.preview_url || "/audio/presets/shehnai-wedding.wav";
  const previewData = tpl?.preview ?? {
    primaryName: "Aarav Mehta",
    secondaryName: "Priya Sharma",
  };

  return (
    <InteractiveTemplatePreview
      slug={slug}
      templateName={templateName}
      songUrl={songUrl}
      previewData={previewData}
    />
  );
}
