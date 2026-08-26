import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class SavePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerRef?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  method?: string;
}
