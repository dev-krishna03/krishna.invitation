import { prisma } from "@/lib/prisma";
import { decryptCredentials } from "@/lib/crypto";
import { Gateway } from "@prisma/client";
import type { PaymentProvider } from "./types";
import { RazorpayProvider } from "./providers/razorpay";
import { StripeProvider } from "./providers/stripe";
import { CashfreeProvider } from "./providers/cashfree";
import { PhonePeProvider } from "./providers/phonepe";

let cached: { provider: PaymentProvider; loadedAt: number } | null = null;
const CACHE_MS = 60_000;

export function invalidatePaymentCache() {
  cached = null;
}

function build(name: Gateway, creds: Record<string, unknown>): PaymentProvider {
  switch (name) {
    case Gateway.RAZORPAY:
      return new RazorpayProvider(creds as never);
    case Gateway.STRIPE:
      return new StripeProvider(creds as never);
    case Gateway.CASHFREE:
      return new CashfreeProvider(creds as never);
    case Gateway.PHONEPE:
      return new PhonePeProvider(creds as never);
  }
}

export async function getProvider(name: Gateway): Promise<PaymentProvider> {
  const row = await prisma.paymentGateway.findUnique({ where: { name } });
  if (!row) throw new Error(`Gateway ${name} not configured`);
  const creds = decryptCredentials(row.credentials as Record<string, unknown>);
  return build(name, { ...creds, webhook_secret: row.webhook_secret ?? undefined });
}

export async function getActivePaymentProvider(): Promise<PaymentProvider> {
  if (cached && Date.now() - cached.loadedAt < CACHE_MS) return cached.provider;
  const active = await prisma.paymentGateway.findFirst({ where: { is_active: true } });
  if (!active) throw new Error("No active payment gateway");
  const creds = decryptCredentials(active.credentials as Record<string, unknown>);
  const provider = build(active.name, { ...creds, webhook_secret: active.webhook_secret ?? undefined });
  cached = { provider, loadedAt: Date.now() };
  return provider;
}
