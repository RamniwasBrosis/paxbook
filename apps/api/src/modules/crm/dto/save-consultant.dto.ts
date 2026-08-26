import { IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class SaveConsultantDto {
  @IsUUID()
  adminUserId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetRevenue?: number;
}
