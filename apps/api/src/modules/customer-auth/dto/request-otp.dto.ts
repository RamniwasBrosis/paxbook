import { IsString, Matches } from "class-validator";

export class RequestOtpDto {
  @IsString()
  @Matches(/^[0-9+][0-9\s-]{6,14}$/, { message: "Enter a valid phone number." })
  phone!: string;
}
