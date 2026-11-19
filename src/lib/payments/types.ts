import type { Gateway } from "@prisma/client";

export type Money = { amount: number; currency: string };

export type OrderInput = {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
  receipt?: string;
};

export type Order = {
  id: string; // gateway order id
  amount: number;
  currency: string;
  checkout: Record<string, unknown>; // gateway-specific client payload
};

export type VerificationInput = {
  orderId: string;
  paymentId: string;
  signature?: string;
  raw?: Record<string, unknown>;
};

export type PaymentVerification = {
  ok: boolean;
  paymentId: string;
  amount?: number;
  currency?: string;
};

export type SubscriptionInput = {
  planId: string;
  customerId: string;
  metadata?: Record<string, unknown>;
};

export type SubscriptionResult = {
  id: string;
  status: "ACTIVE" | "PENDING" | "FAILED";
  current_period_start: Date;
  current_period_end: Date;
  raw?: Record<string, unknown>;
};

export type RefundResult = {
  id: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
};

export type WebhookEvent = {
  id: string;
  type: string;
  paymentId?: string;
  orderId?: string;
  subscriptionId?: string;
  status?: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  raw: unknown;
};

export interface PaymentProvider {
  readonly gateway: Gateway;
  createOrder(input: OrderInput): Promise<Order>;
  verifyPayment(input: VerificationInput): Promise<PaymentVerification>;
  createSubscription(input: SubscriptionInput): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  processRefund(paymentId: string, amount?: number): Promise<RefundResult>;
  parseWebhook(
    headers: Record<string, string>,
    rawBody: string,
  ): Promise<WebhookEvent>;
}
