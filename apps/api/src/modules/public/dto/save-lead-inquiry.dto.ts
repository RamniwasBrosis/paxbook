import { IsArray, IsDateString, IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class SaveLeadInquiryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  destinationInterest?: string;

  @IsOptional()
  @IsString()
  message?: string;

  /** e.g. "Callback Request", "AI Trip Planner" — falls back to "Website" so admins can tell inquiries apart in the CRM. */
  @IsOptional()
  @IsString()
  source?: string;

  /** The rest come from the step-based "customize your trip" wizard — all optional since the plain inquiry form doesn't collect them. */
  @IsOptional()
  @IsString()
  travellerType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  tripDuration?: string;

  @IsOptional()
  @IsString()
  departureCity?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;
}
