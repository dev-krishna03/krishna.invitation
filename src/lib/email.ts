import { prisma } from "./prisma";
import { decryptCredentials } from "./crypto";
import type { EmailType } from "./email-templates";

export type SendEmailInput = {
  to: string | string[];
  templateId: EmailType | number | string;
  params?: Record<string, unknown>;
  subject?: string;
  htmlContent?: string;
};

type BrevoCreds = { api_key?: string; sender_email?: string; sender_name?: string };

async function brevoConfig(): Promise<{ creds: BrevoCreds; templateMap: Record<string, number> } | null> {
  const [integration, senderRow, mapRow] = await Promise.all([
    prisma.integrationCredential.findUnique({ where: { service_slug: "brevo" } }),
    prisma.siteSetting.findUnique({ where: { key: "brevo_sender" } }),
    prisma.siteSetting.findUnique({ where: { key: "brevo_template_map" } }),
  ]);
  if (!integration || !integration.is_active) return null;
  const decrypted = decryptCredentials(integration.credentials as Record<string, unknown>) as BrevoCreds;
  const sender = (senderRow?.value as BrevoCreds) ?? {};
  const map = (mapRow?.value as Record<string, number>) ?? {};
  return { creds: { ...decrypted, ...sender }, templateMap: map };
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const cfg = await brevoConfig();
  if (!cfg || !cfg.creds.api_key) {
    console.log("[email:stub]", { to: input.to, templateId: input.templateId, params: input.params });
    return;
  }

  const toList = Array.isArray(input.to) ? input.to : [input.to];
  const payload: Record<string, unknown> = {
    sender: { email: cfg.creds.sender_email ?? "no-reply@example.com", name: cfg.creds.sender_name ?? "Invitations" },
    to: toList.map((email) => ({ email })),
    params: input.params ?? {},
  };

  if (typeof input.templateId === "number") {
    payload.templateId = input.templateId;
  } else if (typeof input.templateId === "string" && cfg.templateMap[input.templateId]) {
    payload.templateId = cfg.templateMap[input.templateId];
  } else {
    payload.subject = input.subject ?? "Notification";
    payload.htmlContent = input.htmlContent ?? `<pre>${JSON.stringify(input.params ?? {}, null, 2)}</pre>`;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": cfg.creds.api_key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("[email] Brevo error", await res.text());
  }
}

export async function sendBulkEmail(items: SendEmailInput[]): Promise<void> {
  await Promise.all(items.map((i) => sendEmail(i)));
}
