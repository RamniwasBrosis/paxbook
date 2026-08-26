import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { SeoMetaDto } from "../../../common/seo/seo-meta.dto";

export class SaveBlogPostDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsString()
  coverImageKey?: string;

  @IsOptional()
  @IsIn(["DRAFT", "PUBLISHED"])
  status?: "DRAFT" | "PUBLISHED";

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetaDto)
  seo?: SeoMetaDto;
}
