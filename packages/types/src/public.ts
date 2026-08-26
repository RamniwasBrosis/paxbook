import type { BannerDto, HomepageBlockDto, TestimonialDto } from "./cms.js";
import type {
  DestinationActivityDto,
  DestinationDto,
  DestinationHighlightDto,
  DestinationHotelSuggestionDto,
} from "./destination.js";
import type { PackageDetailDto, PackageSummaryDto } from "./package.js";
import type { FaqItemDto } from "./cms.js";
import type { ReviewDto } from "./review.js";

export interface RecentBookingDto {
  id: string;
  customerFirstName: string;
  packageTitle: string;
  packageSlug: string;
  destinationName: string;
  categoryName: string | null;
  coverImageUrl: string | null;
  price: number;
  durationNights: number;
  bookedAt: string;
}

export interface PublicHomepageDto {
  homepageBlocks: HomepageBlockDto[];
  featuredDestinations: DestinationDto[];
  recentPackages: PackageSummaryDto[];
  featuredTestimonials: TestimonialDto[];
  banners: BannerDto[];
  visaFreeDestinations: DestinationDto[];
  recentBookings: RecentBookingDto[];
}

export interface PublicDestinationDetailDto extends DestinationDto {
  packages: PackageSummaryDto[];
  highlights: DestinationHighlightDto[];
  activities: DestinationActivityDto[];
  hotelSuggestions: DestinationHotelSuggestionDto[];
  faqItems: FaqItemDto[];
  similarDestinations: DestinationDto[];
  /** Computed from this destination's own published packages — no separate field to keep in sync. */
  idealDurationRange: string | null;
  startingFromPrice: number | null;
}

export interface PublicPackageDetailDto extends PackageDetailDto {
  reviews: ReviewDto[];
  faqItems: FaqItemDto[];
  similarPackages: PackageSummaryDto[];
}

export interface SaveLeadInquiryDto {
  name: string;
  email?: string;
  phone?: string;
  destinationInterest?: string;
  message?: string;
}

export interface PublicStatsDto {
  destinationCount: number;
  packageCount: number;
  tripsBookedCount: number;
  averageRating: number | null;
  reviewCount: number;
}
