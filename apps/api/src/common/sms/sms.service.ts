import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Twilio from "twilio";
import { PrismaService } from "../prisma/prisma.service";
import { decryptSecret } from "../crypto/encryption";

export interface SmsSendResult {
  sent: boolean;
  reason?: string;
}

/**
 * Real SMS delivery via Twilio, resolved per tenant (Settings -> Integrations).
 * "Not configured" is an expected, common state — callers get { sent: false,
 * reason } back rather than a thrown error, so a tenant that hasn't set up
 * messaging yet doesn't break the flow it's a side-effect of (e.g. OTP request).
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async send(tenantId: string, to: string, body: string): Promise<SmsSendResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { twilioAccountSid: true, twilioAuthTokenEncrypted: true, twilioFromNumber: true },
    });

    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (!tenant?.twilioAccountSid || !tenant.twilioAuthTokenEncrypted || !tenant.twilioFromNumber || !encryptionKey) {
      return { sent: false, reason: "SMS provider not configured for this tenant." };
    }

    try {
      const authToken = decryptSecret(tenant.twilioAuthTokenEncrypted, encryptionKey);
      const client = Twilio(tenant.twilioAccountSid, authToken);
      await client.messages.create({ to, from: tenant.twilioFromNumber, body });
      return { sent: true };
    } catch (err) {
      this.logger.warn(`SMS send failed for tenant ${tenantId}: ${(err as Error).message}`);
      return { sent: false, reason: "SMS provider rejected the message." };
    }
  }

  /** Real WhatsApp delivery via Twilio's WhatsApp channel — separate from the SMS from-number. */
  async sendWhatsapp(tenantId: string, to: string, body: string): Promise<SmsSendResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { twilioAccountSid: true, twilioAuthTokenEncrypted: true, twilioWhatsappFromNumber: true },
    });

    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (!tenant?.twilioAccountSid || !tenant.twilioAuthTokenEncrypted || !tenant.twilioWhatsappFromNumber || !encryptionKey) {
      return { sent: false, reason: "WhatsApp sender not configured for this tenant." };
    }

    try {
      const authToken = decryptSecret(tenant.twilioAuthTokenEncrypted, encryptionKey);
      const client = Twilio(tenant.twilioAccountSid, authToken);
      const from = tenant.twilioWhatsappFromNumber.startsWith("whatsapp:") ? tenant.twilioWhatsappFromNumber : `whatsapp:${tenant.twilioWhatsappFromNumber}`;
      const toWhatsapp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
      await client.messages.create({ to: toWhatsapp, from, body });
      return { sent: true };
    } catch (err) {
      this.logger.warn(`WhatsApp send failed for tenant ${tenantId}: ${(err as Error).message}`);
      return { sent: false, reason: "WhatsApp provider rejected the message." };
    }
  }
}
