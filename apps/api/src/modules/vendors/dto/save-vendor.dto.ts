import { IsArray, IsIn, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class SaveVendorDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(["HOTEL", "TRANSPORT", "GUIDE", "ACTIVITY"])
  categoryType!: "HOTEL" | "TRANSPORT" | "GUIDE" | "ACTIVITY";

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: "ACTIVE" | "INACTIVE";

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];
}
