import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";
import { decryptSecret } from "../crypto/encryption";

export interface EmailSendResult {
  sent: boolean;
  reason?: string;
}

/**
 * Real transactional email via tenant-supplied SMTP (Settings -> Integrations),
 * same "not configured is expected, not an error" contract as SmsService — a
 * tenant without SMTP set up just doesn't get emails sent yet; nothing in the
 * booking/notification flow depends on it succeeding.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async send(tenantId: string, to: string, subject: string, html: string): Promise<EmailSendResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { smtpHost: true, smtpPort: true, smtpUser: true, smtpPasswordEncrypted: true, smtpFromEmail: true },
    });

    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (!tenant?.smtpHost || !tenant.smtpPort || !tenant.smtpPasswordEncrypted || !tenant.smtpFromEmail || !encryptionKey) {
      return { sent: false, reason: "Email provider not configured for this tenant." };
    }

    try {
      const password = decryptSecret(tenant.smtpPasswordEncrypted, encryptionKey);
      const transport = createTransport({
        host: tenant.smtpHost,
        port: tenant.smtpPort,
        secure: tenant.smtpPort === 465,
        auth: tenant.smtpUser ? { user: tenant.smtpUser, pass: password } : undefined,
      });
      await transport.sendMail({ from: tenant.smtpFromEmail, to, subject, html });
      return { sent: true };
    } catch (err) {
      this.logger.warn(`Email send failed for tenant ${tenantId}: ${(err as Error).message}`);
      return { sent: false, reason: "Email provider rejected the message." };
    }
  }
}
