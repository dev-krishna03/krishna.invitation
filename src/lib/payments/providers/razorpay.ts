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

type Creds = {
  key_id: string;
  key_secret: string;
  webhook_secret?: string;
};

export class RazorpayProvider implements PaymentProvider {
  readonly gateway = Gateway.RAZORPAY;
  constructor(private creds: Creds) {}

  private auth() {
    return (
      "Basic " +
      Buffer.from(`${this.creds.key_id}:${this.creds.key_secret}`).toString(
        "base64",
      )
    );
  }

  async createOrder(input: OrderInput): Promise<Order> {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.auth(),
      },
      body: JSON.stringify({
        amount: Math.round(input.amount * 100),
        currency: input.currency,
        receipt: input.receipt,
        notes: input.metadata ?? {},
      }),
    });
    const data = (await res.json()) as { id: string; amount: number; currency: string };
    if (!res.ok) throw new Error(`Razorpay order failed: ${JSON.stringify(data)}`);
    return {
      id: data.id,
      amount: data.amount / 100,
      currency: data.currency,
      checkout: { key: this.creds.key_id, order_id: data.id, amount: data.amount, currency: data.currency },
    };
  }

  async verifyPayment(input: VerificationInput): Promise<PaymentVerification> {
    if (!input.signature) return { ok: false, paymentId: input.paymentId };
    const expected = crypto
      .createHmac("sha256", this.creds.key_secret)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest("hex");
    return {
      ok: crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature)),
      paymentId: input.paymentId,
    };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: this.auth() },
      body: JSON.stringify({ plan_id: input.planId, customer_notify: 1, total_count: 12, notes: input.metadata ?? {} }),
    });
    const data = (await res.json()) as { id: string; status: string; current_start?: number; current_end?: number };
    if (!res.ok) throw new Error(`Razorpay subscription failed: ${JSON.stringify(data)}`);
    const start = data.current_start ? new Date(data.current_start * 1000) : new Date();
    const end = data.current_end ? new Date(data.current_end * 1000) : new Date(Date.now() + 365 * 24 * 3600 * 1000);
    return { id: data.id, status: data.status === "active" ? "ACTIVE" : "PENDING", current_period_start: start, current_period_end: end, raw: data };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: { authorization: this.auth() },
    });
  }

  async processRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: this.auth() },
      body: JSON.stringify(amount ? { amount: Math.round(amount * 100) } : {}),
    });
    const data = (await res.json()) as { id: string; amount: number; status: string };
    if (!res.ok) throw new Error(`Razorpay refund failed: ${JSON.stringify(data)}`);
    return { id: data.id, amount: data.amount / 100, status: data.status === "processed" ? "SUCCESS" : "PENDING" };
  }

  async parseWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookEvent> {
    const secret = this.creds.webhook_secret ?? "";
    const signature = headers["x-razorpay-signature"] ?? "";
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const ok = secret && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    const payload = JSON.parse(rawBody) as { event: string; payload: Record<string, { entity?: { id?: string; order_id?: string; status?: string } }> };
    const payment = payload.payload?.payment?.entity;
    return {
      id: payment?.id ?? `${Date.now()}`,
      type: payload.event,
      paymentId: payment?.id,
      orderId: payment?.order_id,
      status: !ok ? "FAILED" : payment?.status === "captured" ? "SUCCESS" : payment?.status === "failed" ? "FAILED" : "PENDING",
      raw: payload,
    };
  }
}
