import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateIf } from "class-validator";

export class SaveBookingDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  packageId!: string;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(["PENDING", "PARTIAL", "PAID", "REFUNDED"])
  paymentStatus?: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

  @IsOptional()
  @IsString()
  travelStartDate?: string;

  @IsOptional()
  @IsString()
  travelEndDate?: string;

  /** Empty string means "unassign" — same convention as Lead.assignedConsultantId. */
  @IsOptional()
  @ValidateIf((o) => o.consultantId !== "")
  @IsUUID()
  consultantId?: string;
}
