import { IsOptional, IsString } from "class-validator";

export class UpdateVendorProfileDto {
  @IsOptional()
  @IsString()
  contactInfo?: string;
}
