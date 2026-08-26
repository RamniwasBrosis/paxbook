import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class SaveVendorContractDto {
  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @IsOptional()
  @IsString()
  storageKey?: string;
}
