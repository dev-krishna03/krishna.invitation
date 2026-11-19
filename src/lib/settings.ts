import { prisma } from "./prisma";
import { decryptCredentials } from "./crypto";

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return (row?.value as T) ?? null;
}

export async function getIntegration(slug: string): Promise<Record<string, unknown> | null> {
  const row = await prisma.integrationCredential.findUnique({ where: { service_slug: slug } });
  if (!row || !row.is_active) return null;
  return decryptCredentials(row.credentials as Record<string, unknown>);
}
