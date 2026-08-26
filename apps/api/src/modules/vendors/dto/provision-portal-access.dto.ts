import { IsEmail } from "class-validator";

export class ProvisionPortalAccessDto {
  @IsEmail()
  email!: string;
}
