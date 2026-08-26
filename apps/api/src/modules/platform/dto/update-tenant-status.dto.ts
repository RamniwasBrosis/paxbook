import { IsIn } from "class-validator";

export class UpdateTenantStatusDto {
  @IsIn(["ACTIVE", "SUSPENDED"])
  status!: "ACTIVE" | "SUSPENDED";
}
