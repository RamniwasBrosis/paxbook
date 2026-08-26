import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class SaveDestinationHighlightDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class SaveDestinationActivityDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class SaveDestinationHotelSuggestionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  starRating!: number;

  @IsString()
  @MinLength(2)
  area!: string;

  @IsOptional()
  @IsString()
  descriptor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
