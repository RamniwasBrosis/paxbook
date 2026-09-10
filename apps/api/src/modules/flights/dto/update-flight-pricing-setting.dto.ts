import { IsIn, IsNumber, Max, Min } from "class-validator";

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
