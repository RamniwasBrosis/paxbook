import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class SaveFlightRoutePricingRuleDto {
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  depCity!: string;

  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  arrCity!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  airlineCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  flightNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

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
  @IsString()
  @MaxLength(10)
  airlineCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  flightNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

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
