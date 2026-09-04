import { IsBoolean, IsOptional, IsString } from "class-validator";

export class VerifyFlightPaymentDto {
  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;

  /** Accepted only when Razorpay isn't configured yet — dev-mode confirmation path. */
  @IsOptional()
  @IsBoolean()
  devConfirm?: boolean;
}
