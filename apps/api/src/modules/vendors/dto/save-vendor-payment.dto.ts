import { IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class SaveVendorPaymentDto {
  @IsUUID()
  vendorId!: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}
