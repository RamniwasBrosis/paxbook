import { IsOptional, IsString } from "class-validator";

export class SaveLeadFollowUpDto {
  @IsString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  method?: string;
}
