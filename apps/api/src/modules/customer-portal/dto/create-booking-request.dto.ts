import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateBookingRequestDto {
  @IsUUID()
  packageId!: string;

  @IsOptional()
  @IsString()
  travelStartDate?: string;

  @IsOptional()
  @IsString()
  travelEndDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelerCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
