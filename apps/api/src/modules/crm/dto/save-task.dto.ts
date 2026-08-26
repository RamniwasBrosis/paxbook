import { IsIn, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class SaveTaskDto {
  @IsUUID()
  assignedToId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsIn(["OPEN", "IN_PROGRESS", "DONE"])
  status?: "OPEN" | "IN_PROGRESS" | "DONE";

  @IsOptional()
  @IsIn(["LOW", "MEDIUM", "HIGH"])
  priority?: "LOW" | "MEDIUM" | "HIGH";

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;
}
