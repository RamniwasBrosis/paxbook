import { IsArray, IsDateString, IsEmail, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateIf } from "class-validator";

export class SaveLeadDto {
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
  source?: string;

  @IsOptional()
  @IsString()
  destinationInterest?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  /** Empty string means "unassign" — treated specially in LeadsService rather than failing UUID validation. */
  @IsOptional()
  @ValidateIf((o) => o.assignedConsultantId !== "")
  @IsUUID()
  assignedConsultantId?: string;

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
