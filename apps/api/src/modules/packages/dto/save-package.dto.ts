import { Type } from "class-transformer";
import {
  IsArray,
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
import { SeoMetaDto } from "../../../common/seo/seo-meta.dto";
import {
  ItineraryDayInputDto,
  PackageFlightInputDto,
  PackageGalleryImageInputDto,
  PackageHotelInputDto,
  PackagePricingTierInputDto,
  PackageRouteMapPointInputDto,
  SeasonalRateInputDto,
} from "./package-graph.dto";

/**
 * Used for both create and update — a package builder form always submits
 * the entire graph at once, so create/update payloads are identical in
 * shape (PackagesService.update() replaces every child collection wholesale).
 */
export class SavePackageDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsUUID()
  destinationId!: string;

  @IsInt()
  @Min(1)
  durationDays!: number;

  @IsInt()
  @Min(0)
  durationNights!: number;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsIn(["DRAFT", "PENDING_REVIEW", "PUBLISHED"])
  status?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";

  @IsOptional()
  @IsString()
  templateHintSlug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayInputDto)
  itineraryDays!: ItineraryDayInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageHotelInputDto)
  hotels!: PackageHotelInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageFlightInputDto)
  flights!: PackageFlightInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackagePricingTierInputDto)
  pricingTiers!: PackagePricingTierInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeasonalRateInputDto)
  seasonalRates!: SeasonalRateInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageGalleryImageInputDto)
  galleryImages!: PackageGalleryImageInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageRouteMapPointInputDto)
  routeMapPoints!: PackageRouteMapPointInputDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetaDto)
  seo?: SeoMetaDto;
}
