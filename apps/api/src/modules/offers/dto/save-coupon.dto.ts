import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from "class-validator";

export class SaveCouponDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(["FIXED", "PERCENT"])
  discountType!: "FIXED" | "PERCENT";

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBookingAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsUUID()
  destinationId?: string;

  @IsString()
  validFrom!: string;

  @IsString()
  validTo!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
