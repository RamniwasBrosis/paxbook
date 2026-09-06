import { IsNumber, Max, Min } from "class-validator";

export class UpdateFlightPricingSettingDto {
  @IsNumber()
  @Min(-100)
  @Max(500)
  marginPercent!: number;

  @IsNumber()
  @Min(-100000)
  @Max(100000)
  marginFlat!: number;
}
