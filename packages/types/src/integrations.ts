export interface TenantIntegrationsDto {
  razorpayConfigured: boolean;
  razorpayKeyId: string | null;
  smsConfigured: boolean;
  twilioAccountSid: string | null;
  twilioFromNumber: string | null;
  twilioWhatsappFromNumber: string | null;
  googleLoginConfigured: boolean;
  googleClientId: string | null;
  emailConfigured: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFromEmail: string | null;
  ga4MeasurementId: string | null;
  facebookPixelId: string | null;
  googleMapsApiKey: string | null;
  s3Configured: boolean;
  s3Bucket: string | null;
  s3Region: string | null;
  s3PublicBaseUrl: string | null;
}

export interface UpdateTenantIntegrationsDto {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  twilioWhatsappFromNumber?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  ga4MeasurementId?: string;
  facebookPixelId?: string;
  googleMapsApiKey?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3PublicBaseUrl?: string;
}
