import { Type } from "class-transformer";
import { IsArray, IsIn, IsInt, IsString, MinLength, ValidateNested } from "class-validator";

/** FTD's seat-map lookup needs real passenger names (unlike price-check/fare-details) — no
 * dob/gender required for this call, just enough to identify who's being seated. */
export class FlightSeatLookupPassengerDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  fName!: string;

  @IsString()
  @MinLength(1)
  lName!: string;

  @IsIn(["A", "C", "I"])
  pType!: string;
}

export class FlightSeatLookupDto {
  @IsInt()
  flightID!: number;

  @IsString()
  @MinLength(1)
  refID!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSeatLookupPassengerDto)
  passengers!: FlightSeatLookupPassengerDto[];
}
