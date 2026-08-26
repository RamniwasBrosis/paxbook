import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class SaveBannerDto {
  @IsString()
  @MinLength(1)
  imageKey!: string;

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
  @IsString()
  activeFrom?: string;

  @IsOptional()
  @IsString()
  activeTo?: string;
}
