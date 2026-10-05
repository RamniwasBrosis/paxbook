import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsNumber, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

export class QuoteFlightCouponDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  /** Only for the preview; the booking itself recomputes the discount from server-side prices. */
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class FlightImportantInfoSectionInputDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  points!: string[];
}

export class SaveFlightImportantInfoDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => FlightImportantInfoSectionInputDto)
  sections!: FlightImportantInfoSectionInputDto[];
}
