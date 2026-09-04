import { IsInt, IsString, MinLength } from "class-validator";

export class FlightLookupDto {
  @IsInt()
  flightID!: number;

  @IsString()
  @MinLength(1)
  refID!: string;
}

export class FareRulesLookupDto {
  @IsInt()
  flightID!: number;
}
