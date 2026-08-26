import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from "class-validator";

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  roleId!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  password!: string;
}
