import { IsString, MinLength } from "class-validator";

export class ChangeVendorPasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
