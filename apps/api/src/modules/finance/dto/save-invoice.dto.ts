import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class SaveInvoiceDto {
  @IsUUID()
  bookingId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  storageKey?: string;
}
