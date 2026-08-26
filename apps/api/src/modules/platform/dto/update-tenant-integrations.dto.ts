import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class UpdateTenantIntegrationsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  razorpayKeyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  razorpayKeySecret?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  twilioAccountSid?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  twilioAuthToken?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  twilioFromNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  twilioWhatsappFromNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  googleClientId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  googleClientSecret?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  smtpHost?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  smtpUser?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  smtpPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  smtpFromEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  ga4MeasurementId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  facebookPixelId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  googleMapsApiKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  s3AccessKeyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  s3SecretAccessKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  s3Bucket?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  s3Region?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  s3PublicBaseUrl?: string;
}
