import { IsString, Length, MaxLength } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  @MaxLength(254)
  identifier!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

export class VerifyOtpIdentifierDto {
  @IsString()
  @MaxLength(254)
  identifier!: string;
}
