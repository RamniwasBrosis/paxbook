import { IsNumber, IsOptional, Min } from "class-validator";

export class UpdateConsultantDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetRevenue?: number;
}
