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
  merchant_id: string;
  salt_key: string;
  salt_index: string;
  env: "TEST" | "LIVE";
  webhook_user?: string;
  webhook_pass?: string;
};

export class PhonePeProvider implements PaymentProvider {
  readonly gateway = Gateway.PHONEPE;
  constructor(private creds: Creds) {}

  private base() {
    return this.creds.env === "LIVE"
      ? "https://api.phonepe.com/apis/hermes"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox";
  }

  private checksum(payload: string, endpoint: string) {
    const raw = payload + endpoint + this.creds.salt_key;
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return `${hash}###${this.creds.salt_index}`;
  }

  async createOrder(input: OrderInput): Promise<Order> {
    const txnId = `phonepe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      merchantId: this.creds.merchant_id,
      merchantTransactionId: txnId,
      amount: Math.round(input.amount * 100),
      redirectUrl: (input.metadata?.redirectUrl as string) ?? "",
      redirectMode: "POST",
      callbackUrl: (input.metadata?.callbackUrl as string) ?? "",
      paymentInstrument: { type: "PAY_PAGE" },
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = this.checksum(b64, "/pg/v1/pay");
    const res = await fetch(`${this.base()}/pg/v1/pay`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-VERIFY": checksum },
      body: JSON.stringify({ request: b64 }),
    });
    const data = (await res.json()) as { data?: { instrumentResponse?: { redirectInfo?: { url: string } } } };
    if (!res.ok) throw new Error(`PhonePe order failed: ${JSON.stringify(data)}`);
    const redirect = data.data?.instrumentResponse?.redirectInfo?.url ?? "";
    return { id: txnId, amount: input.amount, currency: input.currency, checkout: { redirectUrl: redirect } };
  }

  async verifyPayment(input: VerificationInput): Promise<PaymentVerification> {
    const endpoint = `/pg/v1/status/${this.creds.merchant_id}/${input.orderId}`;
    const checksum = this.checksum("", endpoint);
    const res = await fetch(`${this.base()}${endpoint}`, {
      headers: { "X-VERIFY": checksum, "X-MERCHANT-ID": this.creds.merchant_id },
    });
    const data = (await res.json()) as { code: string; data?: { transactionId: string; amount: number } };
    return { ok: data.code === "PAYMENT_SUCCESS", paymentId: data.data?.transactionId ?? input.paymentId, amount: data.data?.amount ? data.data.amount / 100 : undefined, currency: "INR" };
  }

  async createSubscription(_input: SubscriptionInput): Promise<SubscriptionResult> {
    throw new Error("PhonePe subscriptions out of MVP scope.");
  }
  async cancelSubscription(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async processRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    const refundId = `refund_${Date.now()}`;
    const payload = {
      merchantId: this.creds.merchant_id,
      merchantUserId: "ADMIN",
      originalTransactionId: paymentId,
      merchantTransactionId: refundId,
      amount: Math.round((amount ?? 0) * 100),
      callbackUrl: "",
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = this.checksum(b64, "/pg/v1/refund");
    const res = await fetch(`${this.base()}/pg/v1/refund`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-VERIFY": checksum },
      body: JSON.stringify({ request: b64 }),
    });
    const data = (await res.json()) as { code: string; data?: { amount: number } };
    if (!res.ok) throw new Error(`PhonePe refund failed: ${JSON.stringify(data)}`);
    return { id: refundId, amount: data.data?.amount ? data.data.amount / 100 : amount ?? 0, status: data.code === "PAYMENT_SUCCESS" ? "SUCCESS" : "PENDING" };
  }

  async parseWebhook(headers: Record<string, string>, rawBody: string): Promise<WebhookEvent> {
    const auth = headers["authorization"] ?? "";
    const expected = "SHA256(" + crypto.createHash("sha256").update(`${this.creds.webhook_user ?? ""}:${this.creds.webhook_pass ?? ""}`).digest("hex") + ")";
    const ok = Boolean(this.creds.webhook_user) && auth === expected;
    const payload = JSON.parse(rawBody) as { event?: string; payload?: { merchantTransactionId?: string; state?: string } };
    const state = payload.payload?.state;
    return {
      id: payload.payload?.merchantTransactionId ?? `pp_${Date.now()}`,
      type: payload.event ?? "payment",
      orderId: payload.payload?.merchantTransactionId,
      paymentId: payload.payload?.merchantTransactionId,
      status: !ok ? "FAILED" : state === "COMPLETED" ? "SUCCESS" : state === "FAILED" ? "FAILED" : "PENDING",
      raw: payload,
    };
  }
}
