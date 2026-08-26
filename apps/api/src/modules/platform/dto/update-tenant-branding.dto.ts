import { IsIn, IsOptional, IsString, Matches } from "class-validator";

export class UpdateTenantBrandingDto {
  @IsOptional()
  @IsString()
  logoStorageKey?: string;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: "primaryColor must be a hex color like #0f4c81." })
  primaryColor?: string;

  @IsOptional()
  @IsIn(["classic", "modern"])
  templateSlug?: "classic" | "modern";

  @IsOptional()
  @IsString()
  customDomain?: string;
}
