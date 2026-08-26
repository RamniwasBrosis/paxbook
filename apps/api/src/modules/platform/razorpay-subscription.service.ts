import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomUUID } from "node:crypto";
import Razorpay from "razorpay";

export interface RazorpaySubscriptionResult {
  razorpaySubscriptionId: string;
  keyId: string | null;
  mock: boolean;
}

/**
 * Real Razorpay Subscriptions API integration, activated the moment
 * RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are set — same "mock until configured" pattern
 * as customer-portal/razorpay.service.ts, just for recurring billing instead of a
 * one-off booking payment.
 */
@Injectable()
export class RazorpaySubscriptionService {
  private readonly client: Razorpay | null;

  constructor(private readonly configService: ConfigService) {
    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");
    this.client = keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async createSubscription(razorpayPlanId: string | null, totalCount: number): Promise<RazorpaySubscriptionResult> {
    if (!this.client || !razorpayPlanId) {
      return { razorpaySubscriptionId: `mock_sub_${randomUUID()}`, keyId: null, mock: true };
    }
    const subscription = await this.client.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: totalCount,
      customer_notify: 1,
    });
    return {
      razorpaySubscriptionId: subscription.id,
      keyId: this.configService.get<string>("RAZORPAY_KEY_ID") ?? null,
      mock: false,
    };
  }

  verifySignature(subscriptionId: string, paymentId: string, signature: string): boolean {
    const secret = this.configService.get<string>("RAZORPAY_KEY_SECRET");
    if (!secret) return false;
    const expected = createHmac("sha256", secret).update(`${paymentId}|${subscriptionId}`).digest("hex");
    return expected === signature;
  }
}
