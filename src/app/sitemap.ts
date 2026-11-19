import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const templates = await prisma.template.findMany({ where: { is_active: true }, select: { slug: true, created_at: true } });
  const invitations = await prisma.invitation.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
    take: 5000,
  });
  const base_urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/gallery` },
    { url: `${base}/pricing` },
    { url: `${base}/about` },
    { url: `${base}/contact` },
  ];
  return [
    ...base_urls,
    ...templates.map((t) => ({ url: `${base}/try/${t.slug}`, lastModified: t.created_at })),
    ...invitations.map((i) => ({ url: `${base}/invite/${i.slug}`, lastModified: i.updated_at })),
  ];
}
