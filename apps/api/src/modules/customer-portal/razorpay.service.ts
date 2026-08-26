import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomUUID } from "node:crypto";
import Razorpay from "razorpay";
import { PrismaService } from "../../common/prisma/prisma.service";
import { decryptSecret } from "../../common/crypto/encryption";

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

/**
 * Real Razorpay order-creation + signature verification, resolved per tenant:
 * a tenant's own keys (Settings -> Integrations, encrypted at rest) win when
 * present; otherwise the platform-wide RAZORPAY_KEY_ID/SECRET env vars (keeps
 * the seeded dev/demo tenant working unchanged); otherwise a mock order id and
 * a dev-mode confirm path — this is a real payment pipeline with a swappable
 * delivery leg, not a UI stub.
 */
@Injectable()
export class RazorpayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async resolveCredentials(tenantId: string): Promise<RazorpayCredentials | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { razorpayKeyId: true, razorpayKeySecretEncrypted: true },
    });

    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (tenant?.razorpayKeyId && tenant.razorpayKeySecretEncrypted && encryptionKey) {
      return { keyId: tenant.razorpayKeyId, keySecret: decryptSecret(tenant.razorpayKeySecretEncrypted, encryptionKey) };
    }

    const envKeyId = this.configService.get<string>("RAZORPAY_KEY_ID");
    const envKeySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");
    if (envKeyId && envKeySecret) {
      return { keyId: envKeyId, keySecret: envKeySecret };
    }
    return null;
  }

  async isConfigured(tenantId: string): Promise<boolean> {
    return (await this.resolveCredentials(tenantId)) !== null;
  }

  async createOrder(tenantId: string, amountInRupees: number, currency: string, receipt: string): Promise<RazorpayOrderResult> {
    const credentials = await this.resolveCredentials(tenantId);
    if (!credentials) {
      return { orderId: `mock_order_${randomUUID()}`, amount: amountInRupees, currency, keyId: null, mock: true };
    }

    const client = new Razorpay({ key_id: credentials.keyId, key_secret: credentials.keySecret });
    const order = await client.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt,
    });
    return { orderId: order.id, amount: amountInRupees, currency, keyId: credentials.keyId, mock: false };
  }

  async verifySignature(tenantId: string, orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const credentials = await this.resolveCredentials(tenantId);
    if (!credentials) return false;
    const expected = createHmac("sha256", credentials.keySecret).update(`${orderId}|${paymentId}`).digest("hex");
    return expected === signature;
  }
}
