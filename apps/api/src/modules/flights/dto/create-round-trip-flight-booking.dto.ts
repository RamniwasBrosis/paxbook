import { Type } from "class-transformer";
import { IsEmail, IsInt, IsObject, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { SearchFlightDto } from "./search-flight.dto";
import { FlightGstInputDto, FlightPassengerInputDto } from "./create-flight-booking.dto";

export class RoundTripLegDto {
  @IsInt()
  flightID!: number;

  @IsString()
  @MinLength(1)
  refID!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => SearchFlightDto)
  searchContext!: SearchFlightDto;
}

export class CreateRoundTripFlightBookingDto {
  @IsObject()
  @ValidateNested()
  @Type(() => RoundTripLegDto)
  onward!: RoundTripLegDto;

  @IsObject()
  @ValidateNested()
  @Type(() => RoundTripLegDto)
  return!: RoundTripLegDto;

  @ValidateNested({ each: true })
  @Type(() => FlightPassengerInputDto)
  passengers!: FlightPassengerInputDto[];

  @IsString()
  @MinLength(10)
  mobile!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  firstPaxPanNo?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FlightGstInputDto)
  gst?: FlightGstInputDto;
}
