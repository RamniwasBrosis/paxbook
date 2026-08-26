import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from "class-validator";

export class SaveTestimonialDto {
  @IsString()
  @MinLength(1)
  customerName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  imageKey?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  tripTitle?: string;

  @IsOptional()
  @IsUUID()
  destinationId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsString()
  videoKey?: string;

  @IsOptional()
  @IsString()
  posterKey?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsDateString()
  testimonialDate?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsIn(["DRAFT", "PENDING_REVIEW", "PUBLISHED"])
  status?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
}
