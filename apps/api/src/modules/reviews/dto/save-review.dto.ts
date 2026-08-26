import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from "class-validator";

export class SaveReviewDto {
  @IsUUID()
  packageId!: string;

  @IsString()
  @MinLength(1)
  authorName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(1)
  comment!: string;

  @IsOptional()
  @IsIn(["PENDING", "APPROVED", "REJECTED"])
  status?: "PENDING" | "APPROVED" | "REJECTED";
}
