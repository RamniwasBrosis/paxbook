import { IsBoolean, IsIn, IsInt, IsNumber, Max, Min } from "class-validator";

export class UpdateFlightPricingSettingDto {
  @IsNumber()
  @Min(-100)
  @Max(500)
  marginPercent!: number;

  @IsNumber()
  @Min(-100000)
  @Max(100000)
  marginFlat!: number;

  /** Which of the two numbers above is actually applied — only one ever takes effect. */
  @IsIn(["PERCENT", "FLAT"])
  marginType!: "PERCENT" | "FLAT";
}

export class UpdateFlightCheckoutSettingDto {
  @IsBoolean()
  convenienceFeeEnabled!: boolean;

  /** GST % charged on our final margin as the convenience fee. */
  @IsNumber()
  @Min(0)
  @Max(100)
  convenienceFeeGstPercent!: number;

  /** Minutes to pay after confirming the review. */
  @IsInt()
  @Min(2)
  @Max(60)
  paymentWindowMinutes!: number;
}
