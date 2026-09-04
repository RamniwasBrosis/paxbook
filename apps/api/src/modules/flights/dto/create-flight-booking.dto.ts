import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsInt, IsObject, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { SearchFlightDto } from "./search-flight.dto";

export class FlightPassengerInputDto {
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

  @IsIn(["M", "F"])
  gender!: string;

  @IsString()
  @MinLength(1)
  dob!: string; // DD-MM-YYYY

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  ppNo?: string;

  @IsOptional()
  @IsString()
  ppIss?: string;

  @IsOptional()
  @IsString()
  ppExp?: string;

  @IsOptional()
  @IsString()
  ppNat?: string;
}

export class FlightGstInputDto {
  @IsString()
  @MinLength(1)
  number!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  mobile!: string;

  @IsString()
  @MinLength(1)
  address!: string;

  @IsString()
  @MinLength(1)
  company!: string;
}

export class CreateFlightBookingDto {
  @IsInt()
  flightID!: number;

  @IsString()
  @MinLength(1)
  refID!: string;

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
  @IsBoolean()
  webCheckin?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FlightGstInputDto)
  gst?: FlightGstInputDto;

  /** The original search parameters, so the booking record captures the full trip context (route, dates, pax mix). */
  @IsObject()
  @ValidateNested()
  @Type(() => SearchFlightDto)
  searchContext!: SearchFlightDto;
}
