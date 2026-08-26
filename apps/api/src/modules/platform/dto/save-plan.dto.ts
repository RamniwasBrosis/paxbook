import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class SavePlanDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAdminUsers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPackages?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  razorpayPlanId?: string;
}
