import { IsIn } from "class-validator";

export class UpdateRefundStatusDto {
  @IsIn(["APPROVED", "PROCESSED", "REJECTED"])
  status!: "APPROVED" | "PROCESSED" | "REJECTED";
}
