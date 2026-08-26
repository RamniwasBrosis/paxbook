import { IsInt, IsObject, IsOptional, IsString, Min, MinLength } from "class-validator";

export class SaveHomepageBlockDto {
  @IsString()
  @MinLength(1)
  type!: string;

  @IsObject()
  configJson!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
