import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

/**
 * Meta Webhook verification handshake (GET)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = await getWhatsAppConfig();

  if (mode === "subscribe" && token === config.webhook_verify_token) {
    console.log("WhatsApp webhook verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * Meta Webhook message delivery updates and incoming messages (POST)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value?.statuses) {
            for (const status of value.statuses) {
              const msgId = status.id;
              const statusType = status.status; // "sent" | "delivered" | "read" | "failed"
              console.log(`WhatsApp message ${msgId} status update: ${statusType}`);

              // Update any WhatsAppContext sent metrics if present
              if (statusType === "sent") {
                await prisma.whatsAppContext
                  .updateMany({
                    where: { is_primary: true },
                    data: { sent_today: { increment: 1 } },
                  })
                  .catch(() => {});
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err: any) {
    console.error("WhatsApp Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
