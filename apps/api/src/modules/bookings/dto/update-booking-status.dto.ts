import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateBookingStatusDto {
  @IsIn(["DRAFT", "CONFIRMED", "COMPLETED", "CANCELLED"])
  toStatus!: "DRAFT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

  @IsOptional()
  @IsString()
  note?: string;
}
