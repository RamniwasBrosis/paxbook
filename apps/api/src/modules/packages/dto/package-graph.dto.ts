import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class PackageActivityInputDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsUUID()
  activityVendorId?: string;

  @IsOptional()
  @IsString()
  timeLabel?: string;

  @IsOptional()
  @IsString()
  imageStorageKey?: string;
}

export class ItineraryDayInputDto {
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageActivityInputDto)
  activities?: PackageActivityInputDto[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mealsIncluded?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  imageStorageKey?: string;
}

export class PackageHotelInputDto {
  @IsString()
  @MinLength(1)
  cityName!: string;

  @IsOptional()
  @IsUUID()
  hotelVendorId?: string;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsString()
  mealPlan?: string;

  @IsInt()
  @Min(1)
  checkInDay!: number;

  @IsInt()
  @Min(1)
  checkOutDay!: number;

  @IsOptional()
  @IsString()
  imageStorageKey?: string;
}

export class PackageFlightInputDto {
  @IsString()
  @MinLength(1)
  sector!: string;

  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  dayNumber?: number;
}

export class PackagePricingTierInputDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class SeasonalRateInputDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsIn(["FIXED", "PERCENT"])
  priceModifierType!: "FIXED" | "PERCENT";

  @IsNumber()
  value!: number;
}

export class PackageGalleryImageInputDto {
  @IsString()
  @MinLength(1)
  storageKey!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class PackageRouteMapPointInputDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  label?: string;
}
