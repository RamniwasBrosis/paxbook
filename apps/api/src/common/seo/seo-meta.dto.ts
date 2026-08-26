import { IsOptional, IsString } from "class-validator";

/** Embedded in create/update DTOs for entities with polymorphic SeoMeta (destinations, packages, blog posts). */
export class SeoMetaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ogImageKey?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;
}
