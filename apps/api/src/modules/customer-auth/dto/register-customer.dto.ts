import { Equals, IsEmail, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

/** Step 1 of signup: details + password; an email OTP (and SMS OTP when available) follows. */
export class RegisterCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^[0-9+][0-9\s-]{9,15}$/, { message: "Enter a valid mobile number." })
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  confirmPassword!: string;

  @Equals(true, { message: "Please accept the Terms and Privacy Policy." })
  acceptTerms!: boolean;

  @IsString()
  captchaId!: string;

  @IsString()
  @Length(1, 12)
  captchaAnswer!: string;
}

/** Step 2 of signup: the codes sent to the email (and mobile, when an SMS code was sent). */
export class VerifySignupDto {
  @IsString()
  signupId!: string;

  @IsString()
  @Length(6, 6)
  emailCode!: string;

  @IsOptional()
  @IsString()
  @Length(0, 6)
  phoneCode?: string;
}

export class ResendSignupOtpDto {
  @IsString()
  signupId!: string;

  @IsString()
  @Matches(/^(EMAIL|SMS)$/)
  channel!: "EMAIL" | "SMS";
}
