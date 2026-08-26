import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { SeoMetaDto } from "../../../common/seo/seo-meta.dto";

export class SavePageDto {
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
  @IsIn(["DRAFT", "PUBLISHED"])
  status?: "DRAFT" | "PUBLISHED";

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetaDto)
  seo?: SeoMetaDto;
}
