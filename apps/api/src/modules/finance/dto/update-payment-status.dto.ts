import { IsIn } from "class-validator";

export class UpdatePaymentStatusDto {
  @IsIn(["CAPTURED", "FAILED", "REFUNDED"])
  status!: "CAPTURED" | "FAILED" | "REFUNDED";
}
