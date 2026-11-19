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

type Creds = { app_id: string; secret_key: string; env: "TEST" | "LIVE"; webhook_secret?: string };

export class CashfreeProvider implements PaymentProvider {
  readonly gateway = Gateway.CASHFREE;
  constructor(private creds: Creds) {}

  private base() {
    return this.creds.env === "LIVE" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  }

  private headers() {
    return {
      "x-client-id": this.creds.app_id,
      "x-client-secret": this.creds.secret_key,
      "x-api-version": "2023-08-01",
      "content-type": "application/json",
    } as Record<string, string>;
  }

  async createOrder(input: OrderInput): Promise<Order> {
    const orderId = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const res = await fetch(`${this.base()}/orders`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: input.amount,
        order_currency: input.currency,
        order_meta: input.metadata ?? {},
        customer_details: input.metadata?.customer ?? { customer_id: "guest", customer_email: "guest@example.com", customer_phone: "9999999999" },
      }),
    });
    const data = (await res.json()) as { order_id: string; payment_session_id: string };
    if (!res.ok) throw new Error(`Cashfree order failed: ${JSON.stringify(data)}`);
    return { id: data.order_id, amount: input.amount, currency: input.currency, checkout: { paymentSessionId: data.payment_session_id } };
  }

  async verifyPayment(input: VerificationInput): Promise<PaymentVerification> {
    const res = await fetch(`${this.base()}/orders/${input.orderId}/payments`, { headers: this.headers() });
    const data = (await res.json()) as Array<{ cf_payment_id: string; payment_status: string; payment_amount: number; payment_currency: string }>;
    const p = data.find((x) => x.cf_payment_id === input.paymentId) ?? data[0];
    return { ok: p?.payment_status === "SUCCESS", paymentId: p?.cf_payment_id ?? input.paymentId, amount: p?.payment_amount, currency: p?.payment_currency };
  }

  async createSubscription(_input: SubscriptionInput): Promise<SubscriptionResult> {
    throw new Error("Cashfree subscriptions handled through recurring orders — wire per product requirements.");
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async processRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    // The caller passes the order id for refunds in Cashfree; keep the shape.
    const res = await fetch(`${this.base()}/orders/${paymentId}/refunds`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ refund_amount: amount, refund_id: `rf_${Date.now()}`, refund_note: "Refund" }),
    });
    const data = (await res.json()) as { cf_refund_id: string; refund_amount: number; refund_status: string };
    if (!res.ok) throw new Error(`Cashfree refund failed: ${JSON.stringify(data)}`);
    return { id: data.cf_refund_id, amount: data.refund_amount, status: data.refund_status === "SUCCESS" ? "SUCCESS" : "PENDING" };
  }

  async parseWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookEvent> {
    const secret = this.creds.webhook_secret ?? this.creds.secret_key;
    const ts = headers["x-webhook-timestamp"] ?? "";
    const signature = headers["x-webhook-signature"] ?? "";
    const expected = crypto.createHmac("sha256", secret).update(ts + rawBody).digest("base64");
    const ok = Boolean(signature) && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    const payload = JSON.parse(rawBody) as { type: string; data: { order?: { order_id: string }; payment?: { cf_payment_id: string; payment_status: string } } };
    const payment = payload.data?.payment;
    return {
      id: `cf_${Date.now()}`,
      type: payload.type,
      paymentId: payment?.cf_payment_id,
      orderId: payload.data?.order?.order_id,
      status: !ok ? "FAILED" : payment?.payment_status === "SUCCESS" ? "SUCCESS" : payment?.payment_status === "FAILED" ? "FAILED" : "PENDING",
      raw: payload,
    };
  }
}
