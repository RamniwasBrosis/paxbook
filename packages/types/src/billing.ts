import type { SubscriptionStatus } from "./platform.js";

export interface SubscriptionDto {
  id: string;
  planId: string;
  planName: string;
  priceMonthly: number;
  currency: string;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export interface BillingActivationOrderDto {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  keyId: string | null;
  mock: boolean;
}

export interface ConfirmBillingActivationDto {
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  devConfirm?: boolean;
}
