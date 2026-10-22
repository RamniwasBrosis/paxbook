import { IsString, Length, MaxLength } from "class-validator";

/** Password login with an email address or a mobile number. */
export class LoginCustomerDto {
  @IsString()
  @MaxLength(254)
  identifier!: string;

  @IsString()
  password!: string;

  @IsString()
  captchaId!: string;

  @IsString()
  @Length(1, 12)
  captchaAnswer!: string;
}
