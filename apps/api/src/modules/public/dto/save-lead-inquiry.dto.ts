import { IsArray, IsDateString, IsEmail, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from "class-validator";

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  travellerCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  stayType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  travelPace?: string;
}
