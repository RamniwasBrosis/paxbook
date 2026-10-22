import { IsString, Length, MaxLength } from "class-validator";

/** OTP login: the code goes to the email address or mobile number given. */
export class RequestOtpDto {
  @IsString()
  @MaxLength(254)
  identifier!: string;

  @IsString()
  captchaId!: string;

  @IsString()
  @Length(1, 12)
  captchaAnswer!: string;
}
