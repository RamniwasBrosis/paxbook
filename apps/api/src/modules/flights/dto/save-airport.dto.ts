import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class SaveAirportDto {
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  code!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(100)
  country!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAirportDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
