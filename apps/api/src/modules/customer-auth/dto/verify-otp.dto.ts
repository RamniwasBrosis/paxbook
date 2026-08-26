import { IsString, Length, Matches } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  @Matches(/^[0-9+][0-9\s-]{6,14}$/, { message: "Enter a valid phone number." })
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
