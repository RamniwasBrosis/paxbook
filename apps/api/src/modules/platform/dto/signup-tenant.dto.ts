import { IsEmail, IsString, IsUUID, Matches, MinLength } from "class-validator";

export class SignupTenantDto {
  @IsString()
  @MinLength(2)
  agencyName!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/, { message: "Subdomain must be lowercase letters, numbers, and hyphens only." })
  subdomain!: string;

  @IsString()
  @MinLength(2)
  ownerName!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(8)
  ownerPassword!: string;

  @IsUUID()
  planId!: string;
}
