import type { SeoMetaFieldsDto, SeoMetaInputDto } from "./destination.js";

export type PackageStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
export type PriceModifierType = "FIXED" | "PERCENT";

export interface PackageActivityDto {
  id?: string;
  name: string;
  description?: string;
  isOptional?: boolean;
  activityVendorId?: string;
  timeLabel?: string;
  imageStorageKey?: string;
  imageUrl?: string;
}

export interface ItineraryDayDto {
  id?: string;
  dayNumber: number;
  title: string;
  description?: string;
  activities: PackageActivityDto[];
  location?: string;
  mealsIncluded?: string[];
  notes?: string;
  imageStorageKey?: string;
  imageUrl?: string;
}

export interface PackageHotelDto {
  id?: string;
  cityName: string;
  hotelVendorId?: string;
  roomType?: string;
  mealPlan?: string;
  checkInDay: number;
  checkOutDay: number;
  imageStorageKey?: string;
  imageUrl?: string;
}

export interface PackageFlightDto {
  id?: string;
  sector: string;
  carrierName?: string;
  isIncluded?: boolean;
  dayNumber?: number;
}

export interface PackagePricingTierDto {
  id?: string;
  name: string;
  basePrice: number;
  currency?: string;
}

export interface SeasonalRateDto {
  id?: string;
  startDate: string;
  endDate: string;
  priceModifierType: PriceModifierType;
  value: number;
}

export interface PackageGalleryImageDto {
  id?: string;
  storageKey: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface PackageRouteMapPointDto {
  id?: string;
  lat: number;
  lng: number;
  sortOrder?: number;
  label?: string;
}

export interface PackageSummaryDto {
  id: string;
  title: string;
  slug: string;
  destinationId: string;
  destinationName: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  status: PackageStatus;
  publishedAt: string | null;
  coverImageUrl: string | null;
  /** Fixed vocabulary: Flights / Hotels / Transfers / Activities — drives the inclusions icon row. */
  inclusions: string[];
  createdAt: string;
  updatedAt: string;
  /** Only populated by the public API (destination's theme tags) — admin summaries leave this unset. */
  categoryNames?: string[];
  /** Only populated by the public API — computed from approved Reviews at request time, not stored. */
  avgRating?: number | null;
  reviewCount?: number;
}

export interface PackageDetailDto extends PackageSummaryDto {
  templateHintSlug: string | null;
  itineraryDays: ItineraryDayDto[];
  hotels: PackageHotelDto[];
  flights: PackageFlightDto[];
  pricingTiers: PackagePricingTierDto[];
  seasonalRates: SeasonalRateDto[];
  galleryImages: PackageGalleryImageDto[];
  routeMapPoints: PackageRouteMapPointDto[];
  seo: SeoMetaFieldsDto | null;
}

export interface SavePackageDto {
  title: string;
  slug: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  status?: PackageStatus;
  templateHintSlug?: string;
  inclusions?: string[];
  itineraryDays: ItineraryDayDto[];
  hotels: PackageHotelDto[];
  flights: PackageFlightDto[];
  pricingTiers: PackagePricingTierDto[];
  seasonalRates: SeasonalRateDto[];
  galleryImages: PackageGalleryImageDto[];
  routeMapPoints: PackageRouteMapPointDto[];
  seo?: SeoMetaInputDto;
}
