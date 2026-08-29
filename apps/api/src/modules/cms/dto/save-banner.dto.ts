import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class SaveBannerDto {
  @IsString()
  @MinLength(1)
  imageKey!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsString()
  @MinLength(1)
  placement!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  activeFrom?: string;

  @IsOptional()
  @IsString()
  activeTo?: string;
}
