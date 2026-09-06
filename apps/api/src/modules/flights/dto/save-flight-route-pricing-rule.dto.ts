import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class SaveFlightRoutePricingRuleDto {
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  depCity!: string;

  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  arrCity!: string;

  @IsNumber()
  @Min(-100)
  @Max(500)
  marginPercent!: number;

  @IsNumber()
  @Min(-100000)
  @Max(100000)
  marginFlat!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFlightRoutePricingRuleDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  depCity?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  arrCity?: string;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(500)
  marginPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(-100000)
  @Max(100000)
  marginFlat?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
