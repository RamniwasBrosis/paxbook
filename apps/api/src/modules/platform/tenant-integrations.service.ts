import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { TenantIntegrationsDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { encryptSecret } from "../../common/crypto/encryption";
import type { UpdateTenantIntegrationsDto } from "./dto/update-tenant-integrations.dto";

const SECRET_FIELDS = ["razorpayKeySecret", "twilioAuthToken", "googleClientSecret", "smtpPassword", "s3SecretAccessKey"] as const;

@Injectable()
export class TenantIntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getIntegrations(tenantId: string): Promise<TenantIntegrationsDto> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        razorpayKeyId: true,
        razorpayKeySecretEncrypted: true,
        twilioAccountSid: true,
        twilioAuthTokenEncrypted: true,
        twilioFromNumber: true,
        twilioWhatsappFromNumber: true,
        googleClientId: true,
        googleClientSecretEncrypted: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPasswordEncrypted: true,
        smtpFromEmail: true,
        ga4MeasurementId: true,
        facebookPixelId: true,
        googleMapsApiKey: true,
        s3AccessKeyId: true,
        s3SecretAccessKeyEncrypted: true,
        s3Bucket: true,
        s3Region: true,
        s3PublicBaseUrl: true,
      },
    });

    return {
      razorpayConfigured: Boolean(tenant.razorpayKeyId && tenant.razorpayKeySecretEncrypted),
      razorpayKeyId: tenant.razorpayKeyId,
      smsConfigured: Boolean(tenant.twilioAccountSid && tenant.twilioAuthTokenEncrypted && tenant.twilioFromNumber),
      twilioAccountSid: tenant.twilioAccountSid,
      twilioFromNumber: tenant.twilioFromNumber,
      twilioWhatsappFromNumber: tenant.twilioWhatsappFromNumber,
      googleLoginConfigured: Boolean(tenant.googleClientId && tenant.googleClientSecretEncrypted),
      googleClientId: tenant.googleClientId,
      emailConfigured: Boolean(tenant.smtpHost && tenant.smtpPasswordEncrypted && tenant.smtpFromEmail),
      smtpHost: tenant.smtpHost,
      smtpPort: tenant.smtpPort,
      smtpUser: tenant.smtpUser,
      smtpFromEmail: tenant.smtpFromEmail,
      ga4MeasurementId: tenant.ga4MeasurementId,
      facebookPixelId: tenant.facebookPixelId,
      googleMapsApiKey: tenant.googleMapsApiKey,
      s3Configured: Boolean(tenant.s3AccessKeyId && tenant.s3SecretAccessKeyEncrypted && tenant.s3Bucket),
      s3Bucket: tenant.s3Bucket,
      s3Region: tenant.s3Region,
      s3PublicBaseUrl: tenant.s3PublicBaseUrl,
    };
  }

  async updateIntegrations(tenantId: string, dto: UpdateTenantIntegrationsDto): Promise<TenantIntegrationsDto> {
    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    const hasSecret = SECRET_FIELDS.some((field) => dto[field]);
    if (hasSecret && !encryptionKey) {
      throw new InternalServerErrorException({
        code: "ENCRYPTION_KEY_MISSING",
        message: "Server is not configured to store integration secrets (INTEGRATION_ENCRYPTION_KEY missing).",
      });
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        razorpayKeyId: dto.razorpayKeyId,
        razorpayKeySecretEncrypted: dto.razorpayKeySecret ? encryptSecret(dto.razorpayKeySecret, encryptionKey!) : undefined,
        twilioAccountSid: dto.twilioAccountSid,
        twilioAuthTokenEncrypted: dto.twilioAuthToken ? encryptSecret(dto.twilioAuthToken, encryptionKey!) : undefined,
        twilioFromNumber: dto.twilioFromNumber,
        twilioWhatsappFromNumber: dto.twilioWhatsappFromNumber,
        googleClientId: dto.googleClientId,
        googleClientSecretEncrypted: dto.googleClientSecret ? encryptSecret(dto.googleClientSecret, encryptionKey!) : undefined,
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpUser: dto.smtpUser,
        smtpPasswordEncrypted: dto.smtpPassword ? encryptSecret(dto.smtpPassword, encryptionKey!) : undefined,
        smtpFromEmail: dto.smtpFromEmail,
        ga4MeasurementId: dto.ga4MeasurementId,
        facebookPixelId: dto.facebookPixelId,
        googleMapsApiKey: dto.googleMapsApiKey,
        s3AccessKeyId: dto.s3AccessKeyId,
        s3SecretAccessKeyEncrypted: dto.s3SecretAccessKey ? encryptSecret(dto.s3SecretAccessKey, encryptionKey!) : undefined,
        s3Bucket: dto.s3Bucket,
        s3Region: dto.s3Region,
        s3PublicBaseUrl: dto.s3PublicBaseUrl,
      },
    });

    return this.getIntegrations(tenantId);
  }
}
