import { IsIn, IsOptional, IsString } from "class-validator";

export class ResolveCancellationRequestDto {
  @IsIn(["APPROVED", "REJECTED"])
  status!: "APPROVED" | "REJECTED";

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}
