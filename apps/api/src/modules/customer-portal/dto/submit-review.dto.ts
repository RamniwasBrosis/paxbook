import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class SubmitReviewDto {
  @IsUUID()
  packageId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  comment!: string;
}
