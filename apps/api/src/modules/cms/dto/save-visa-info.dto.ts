import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class SaveVisaInfoDto {
  @IsString()
  @MinLength(1)
  visaType!: string;

  @IsArray()
  @IsString({ each: true })
  requiredDocuments!: string[];

  @IsOptional()
  @IsBoolean()
  isVisaFree?: boolean;

  @IsString()
  @MinLength(1)
  processingTime!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  visaFee?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
