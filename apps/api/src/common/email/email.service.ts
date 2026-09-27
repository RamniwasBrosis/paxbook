import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";
import { decryptSecret } from "../crypto/encryption";

/** A rendered email (see email-layout.ts) or, for older call sites, bare HTML. */
export type EmailBody = string | { html: string; text: string };

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

  async send(
    tenantId: string,
    to: string,
    subject: string,
    body: EmailBody,
    attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>,
  ): Promise<EmailSendResult> {
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
      const html = typeof body === "string" ? body : body.html;
      // Always send a plain-text part too: some clients prefer it and spam filters penalise HTML-only mail.
      const text = typeof body === "string" ? htmlToText(body) : body.text;
      await transport.sendMail({ from: tenant.smtpFromEmail, replyTo: tenant.smtpFromEmail, to, subject, html, text, attachments });
      return { sent: true };
    } catch (err) {
      this.logger.warn(`Email send failed for tenant ${tenantId}: ${(err as Error).message}`);
      return { sent: false, reason: "Email provider rejected the message." };
    }
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
