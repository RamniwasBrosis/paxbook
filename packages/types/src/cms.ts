import type { SeoMetaFieldsDto, SeoMetaInputDto } from "./destination.js";

export type ContentStatus = "DRAFT" | "PUBLISHED";

export interface BannerDto {
  id: string;
  imageKey: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  linkUrl: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
  activeFrom: string | null;
  activeTo: string | null;
}

export interface SaveBannerDto {
  imageKey: string;
  title?: string;
  description?: string;
  ctaText?: string;
  linkUrl?: string;
  placement: string;
  sortOrder?: number;
  isActive?: boolean;
  activeFrom?: string;
  activeTo?: string;
}

export interface FaqItemDto {
  id: string;
  entityType: string | null;
  entityId: string | null;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface SaveFaqItemDto {
  entityType?: string;
  entityId?: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

export type TestimonialStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";

export interface TestimonialDto {
  id: string;
  customerName: string;
  rating: number;
  content: string;
  imageKey: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  slug: string | null;
  title: string | null;
  tripTitle: string | null;
  destinationId: string | null;
  destinationName: string | null;
  packageId: string | null;
  packageTitle: string | null;
  videoKey: string | null;
  videoUrl: string | null;
  posterKey: string | null;
  posterUrl: string | null;
  durationSeconds: number | null;
  testimonialDate: string | null;
  sortOrder: number;
  status: TestimonialStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTestimonialDto {
  customerName: string;
  rating: number;
  content: string;
  imageKey?: string;
  isFeatured?: boolean;
  slug?: string;
  title?: string;
  tripTitle?: string;
  destinationId?: string;
  packageId?: string;
  videoKey?: string;
  posterKey?: string;
  durationSeconds?: number;
  testimonialDate?: string;
  sortOrder?: number;
  status?: TestimonialStatus;
}

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  category: string | null;
  readMinutes: number | null;
  coverImageKey: string | null;
  coverImageUrl: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  seo: SeoMetaFieldsDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBlogPostDto {
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  category?: string;
  readMinutes?: number;
  coverImageKey?: string;
  status?: ContentStatus;
  seo?: SeoMetaInputDto;
}

export interface HomepageBlockDto {
  id: string;
  type: string;
  configJson: Record<string, unknown>;
  sortOrder: number;
}

export interface SaveHomepageBlockDto {
  type: string;
  configJson: Record<string, unknown>;
  sortOrder?: number;
}

export interface PageDto {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: ContentStatus;
  seo: SeoMetaFieldsDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavePageDto {
  title: string;
  slug: string;
  body: string;
  status?: ContentStatus;
  seo?: SeoMetaInputDto;
}

export interface VisaInfoDto {
  countryId: string;
  countryName: string;
  visaType: string | null;
  requiredDocuments: string[];
  isVisaFree: boolean;
  processingTime: string | null;
  visaFee: number | null;
  currency: string | null;
  notes: string | null;
  updatedAt: string | null;
}

export interface SaveVisaInfoDto {
  visaType: string;
  requiredDocuments: string[];
  isVisaFree?: boolean;
  processingTime: string;
  visaFee?: number;
  currency?: string;
  notes?: string;
}
