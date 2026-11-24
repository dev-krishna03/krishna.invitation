import { prisma } from "@/lib/prisma";
import { decryptCredentials } from "@/lib/crypto";

export interface WhatsAppConfig {
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  display_phone_number: string;
  webhook_verify_token: string;
  default_template_name: string;
  is_active: boolean;
  environment: "TEST" | "LIVE";
}

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  waba_id: process.env.WHATSAPP_WABA_ID || "",
  access_token: process.env.WHATSAPP_ACCESS_TOKEN || "",
  display_phone_number: process.env.WHATSAPP_DISPLAY_PHONE || "+91 98765 43210",
  webhook_verify_token: process.env.WHATSAPP_VERIFY_TOKEN || "balcony_whatsapp_webhook_secret_2026",
  default_template_name: "wedding_invitation_v1",
  is_active: false,
  environment: "TEST",
};

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  try {
    const row = await prisma.integrationCredential.findUnique({
      where: { service_slug: "whatsapp" },
    });
    if (!row || !row.credentials) return DEFAULT_WHATSAPP_CONFIG;

    const creds = decryptCredentials(row.credentials as Record<string, unknown>);
    return {
      phone_number_id: (creds.phone_number_id as string) || DEFAULT_WHATSAPP_CONFIG.phone_number_id,
      waba_id: (creds.waba_id as string) || DEFAULT_WHATSAPP_CONFIG.waba_id,
      access_token: (creds.access_token as string) || DEFAULT_WHATSAPP_CONFIG.access_token,
      display_phone_number: (creds.display_phone_number as string) || DEFAULT_WHATSAPP_CONFIG.display_phone_number,
      webhook_verify_token: (creds.webhook_verify_token as string) || DEFAULT_WHATSAPP_CONFIG.webhook_verify_token,
      default_template_name: (creds.default_template_name as string) || DEFAULT_WHATSAPP_CONFIG.default_template_name,
      is_active: row.is_active,
      environment: row.environment as "TEST" | "LIVE",
    };
  } catch (e) {
    console.error("Failed to load WhatsApp integration config:", e);
    return DEFAULT_WHATSAPP_CONFIG;
  }
}

export interface SendWhatsAppResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  fallbackUrl: string;
}

/**
 * Normalizes phone numbers into E.164 without '+' or leading zeros
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Default to India (+91) if 10-digit mobile number provided
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Builds a direct wa.me fallback URL for browser and mobile WhatsApp
 */
export function buildWhatsAppFallbackUrl(phone: string, text: string): string {
  const clean = normalizePhoneNumber(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches test message via Meta WhatsApp Cloud API or validates credentials
 */
export async function testWhatsAppMessage(
  recipientPhone: string,
  customMessage?: string
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const config = await getWhatsAppConfig();
  const cleanPhone = normalizePhoneNumber(recipientPhone);

  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error("Invalid recipient phone number. Provide valid country code + number (e.g., +91 98765 43210).");
  }

  const messageText =
    customMessage ||
    `👑 Balcony Luxury Invitations: WhatsApp Business Cloud API verified successfully!\n\nAutomated guest delivery, RSVP tracking, and venue reminder dispatch are now operational for your account.`;

  // If in TEST mode or missing live token, perform simulated test
  if (!config.access_token || !config.phone_number_id || config.access_token.includes("placeholder") || config.phone_number_id.includes("placeholder")) {
    if (config.environment === "LIVE") {
      throw new Error("Live environment requires valid Phone Number ID and Permanent Access Token.");
    }
    return {
      ok: true,
      messageId: `wamid.SIMULATED_${Date.now()}_${cleanPhone}`,
    };
  }

  // Live Meta Cloud API call
  try {
    const endpoint = `https://graph.facebook.com/v21.0/${config.phone_number_id}/messages`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: true, body: messageText },
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Meta WhatsApp API error (HTTP ${res.status})`;
      throw new Error(errMsg);
    }

    const messageId = data.messages?.[0]?.id || `wamid.SUCCESS_${Date.now()}`;
    return { ok: true, messageId };
  } catch (err: any) {
    console.error("WhatsApp Cloud API dispatch error:", err);
    throw err;
  }
}

/**
 * Dispatches a personalized wedding invitation to a guest
 */
export async function sendWhatsAppInvitation({
  to,
  guestName,
  inviteTitle,
  inviteUrl,
  eventsSummary,
}: {
  to: string;
  guestName: string;
  inviteTitle: string;
  inviteUrl: string;
  eventsSummary?: string;
}): Promise<SendWhatsAppResult> {
  const bodyText = `Namaste ${guestName} Ji,\n\nYou are cordially invited to celebrate ${inviteTitle}.\n\n${
    eventsSummary ? `${eventsSummary}\n\n` : ""
  }Please view your interactive invitation card and RSVP at:\n${inviteUrl}\n\nWith warm regards & blessings,\nThe Host Family`;

  const fallback = buildWhatsAppFallbackUrl(to, bodyText);

  try {
    const res = await testWhatsAppMessage(to, bodyText);
    return { ok: true, messageId: res.messageId, fallbackUrl: fallback };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Failed to deliver via WhatsApp Cloud API",
      fallbackUrl: fallback,
    };
  }
}
