import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ConfirmBillingActivationDto {
  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;

  @IsOptional()
  @IsBoolean()
  devConfirm?: boolean;
}
