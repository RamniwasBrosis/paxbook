import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class SaveRefundDto {
  @IsUUID()
  bookingId!: string;

  @IsUUID()
  paymentId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
