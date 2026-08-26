import { IsIn } from "class-validator";

export class UpdateLeadStatusDto {
  @IsIn(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
  status!: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
}
