import crypto from "node:crypto";
import type {
  Order,
  OrderInput,
  PaymentProvider,
  PaymentVerification,
  RefundResult,
  SubscriptionInput,
  SubscriptionResult,
  VerificationInput,
  WebhookEvent,
} from "../types";
import { Gateway } from "@prisma/client";

type Creds = { secret_key: string; publishable_key: string; webhook_secret?: string };

export class StripeProvider implements PaymentProvider {
  readonly gateway = Gateway.STRIPE;
  constructor(private creds: Creds) {}

  private async stripe<T>(path: string, body: Record<string, string>): Promise<T> {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Bearer ${this.creds.secret_key}`,
      },
      body: new URLSearchParams(body).toString(),
    });
    const data = (await res.json()) as T;
    if (!res.ok) throw new Error(`Stripe error: ${JSON.stringify(data)}`);
    return data;
  }

  async createOrder(input: OrderInput): Promise<Order> {
    const pi = await this.stripe<{ id: string; client_secret: string }>(
      "/payment_intents",
      {
        amount: String(Math.round(input.amount * 100)),
        currency: input.currency.toLowerCase(),
        "automatic_payment_methods[enabled]": "true",
      },
    );
    return {
      id: pi.id,
      amount: input.amount,
      currency: input.currency,
      checkout: { publishableKey: this.creds.publishable_key, clientSecret: pi.client_secret },
    };
  }

  async verifyPayment(input: VerificationInput): Promise<PaymentVerification> {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${input.paymentId}`, {
      headers: { authorization: `Bearer ${this.creds.secret_key}` },
    });
    const data = (await res.json()) as { status: string; amount: number; currency: string };
    return { ok: data.status === "succeeded", paymentId: input.paymentId, amount: data.amount / 100, currency: data.currency };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
    const sub = await this.stripe<{ id: string; status: string; current_period_start: number; current_period_end: number }>(
      "/subscriptions",
      { customer: input.customerId, "items[0][price]": input.planId },
    );
    return {
      id: sub.id,
      status: sub.status === "active" ? "ACTIVE" : "PENDING",
      current_period_start: new Date(sub.current_period_start * 1000),
      current_period_end: new Date(sub.current_period_end * 1000),
      raw: sub as unknown as Record<string, unknown>,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${this.creds.secret_key}` },
    });
  }

  async processRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    const body: Record<string, string> = { payment_intent: paymentId };
    if (amount) body.amount = String(Math.round(amount * 100));
    const r = await this.stripe<{ id: string; amount: number; status: string }>("/refunds", body);
    return { id: r.id, amount: r.amount / 100, status: r.status === "succeeded" ? "SUCCESS" : "PENDING" };
  }

  async parseWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookEvent> {
    const secret = this.creds.webhook_secret ?? "";
    const sig = headers["stripe-signature"] ?? "";
    let ok = false;
    try {
      const parts = Object.fromEntries(sig.split(",").map((kv) => kv.split("=")));
      const t = parts.t;
      const v1 = parts.v1;
      const payload = `${t}.${rawBody}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      ok = Boolean(secret && v1 && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)));
    } catch {
      ok = false;
    }
    const evt = JSON.parse(rawBody) as { id: string; type: string; data: { object: Record<string, unknown> } };
    const obj = evt.data?.object as { id?: string; status?: string } | undefined;
    const status =
      evt.type.startsWith("payment_intent.succeeded") || evt.type === "charge.succeeded" ? "SUCCESS" :
      evt.type.includes("failed") ? "FAILED" :
      evt.type.includes("refund") ? "REFUNDED" : "PENDING";
    return { id: evt.id, type: evt.type, paymentId: obj?.id, status: ok ? status : "FAILED", raw: evt };
  }
}
