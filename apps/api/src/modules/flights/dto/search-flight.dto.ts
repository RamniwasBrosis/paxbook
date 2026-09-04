import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class SearchFlightDto {
  @IsInt()
  @IsIn([0, 1, 2])
  tripType!: number; // 0 OneWay, 1 RoundTrip, 2 MultiCity (not enabled by provider yet)

  @IsInt()
  @IsIn([1, 2])
  serType!: number; // 1 Domestic, 2 International

  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  depCity!: string;

  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  arrCity!: string;

  @IsString()
  @Matches(/^\d{8}$/)
  onDate!: string; // YYYYMMDD

  @IsOptional()
  @IsString()
  reDate?: string; // YYYYMMDD, required when tripType 1

  @IsInt()
  @Min(1)
  @Max(9)
  adt!: number;

  @IsInt()
  @Min(0)
  chd!: number;

  @IsInt()
  @Min(0)
  @Max(4)
  inf!: number;

  @IsString()
  @IsIn(["E", "P", "B", "F"])
  cabin!: string;

  @IsString()
  @IsIn(["A", "S", "C", "D"])
  fareType!: string;

  @IsOptional()
  @IsString()
  refID?: string;
}
