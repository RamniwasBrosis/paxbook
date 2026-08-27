export interface SeoMetaFieldsDto {
  title: string | null;
  description: string | null;
  ogImageKey: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
}

export interface SeoMetaInputDto {
  title?: string;
  description?: string;
  ogImageKey?: string;
  canonicalUrl?: string;
}

export interface CountryDto {
  id: string;
  name: string;
  iso2: string;
  region: string | null;
}

export interface DestinationHighlightDto {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface DestinationActivityDto {
  id: string;
  label: string;
  sortOrder: number;
}

export interface DestinationHotelSuggestionDto {
  id: string;
  name: string | null;
  starRating: number;
  area: string;
  descriptor: string | null;
  sortOrder: number;
}

export interface DestinationDto {
  id: string;
  countryId: string;
  countryName: string;
  countryRegion: string | null;
  name: string;
  slug: string;
  description: string | null;
  heroImageKey: string | null;
  heroImageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  bestTimeToVisit: string | null;
  categoryIds: string[];
  categoryNames: string[];
  seo: SeoMetaFieldsDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDestinationDto {
  countryId: string;
  name: string;
  slug: string;
  description?: string;
  heroImageKey?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  bestTimeToVisit?: string;
  categoryIds?: string[];
  seo?: SeoMetaInputDto;
}

export type UpdateDestinationDto = Partial<CreateDestinationDto>;

export interface SaveDestinationHighlightDto {
  title: string;
  description: string;
  sortOrder?: number;
}

export interface SaveDestinationActivityDto {
  label: string;
  sortOrder?: number;
}

export interface SaveDestinationHotelSuggestionDto {
  name?: string;
  starRating: number;
  area: string;
  descriptor?: string;
  sortOrder?: number;
}
