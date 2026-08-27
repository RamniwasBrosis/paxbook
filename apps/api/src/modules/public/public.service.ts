import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  BannerDto,
  DestinationDto,
  PackageSummaryDto,
  PublicBrandingDto,
  PublicDestinationDetailDto,
  PublicHomepageDto,
  PublicPackageDetailDto,
  PublicStatsDto,
  RecentBookingDto,
  ReviewDto,
  TestimonialDto,
  VisaInfoDto,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CacheService } from "../../common/cache/cache.service";

const DESTINATION_INCLUDE = {
  country: true,
  categoryLinks: { include: { category: true } },
} satisfies Prisma.DestinationInclude;

const PACKAGE_SUMMARY_INCLUDE = {
  destination: true,
  galleryImages: { orderBy: { sortOrder: "asc" }, take: 1 },
  reviews: { where: { status: "APPROVED" as const }, select: { rating: true } },
  categoryLinks: { include: { category: true } },
} satisfies Prisma.PackageInclude;

const RECENT_BOOKING_INCLUDE = {
  customer: true,
  package: { include: { destination: true, galleryImages: { orderBy: { sortOrder: "asc" }, take: 1 }, categoryLinks: { include: { category: true } } } },
} satisfies Prisma.BookingInclude;

const PACKAGE_DETAIL_INCLUDE = {
  destination: true,
  reviews: { where: { status: "APPROVED" as const }, select: { rating: true } },
  itineraryDays: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
  hotels: true,
  flights: true,
  pricingTiers: true,
  seasonalRates: true,
  galleryImages: { orderBy: { sortOrder: "asc" } },
  routeMapPoints: { orderBy: { sortOrder: "asc" } },
  categoryLinks: { include: { category: true } },
} satisfies Prisma.PackageInclude;

const TESTIMONIAL_SUMMARY_INCLUDE = {
  destination: true,
  package: { select: { id: true, title: true } },
} satisfies Prisma.TestimonialInclude;

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly cache: CacheService,
  ) {}

  async getHomepage(tenantId: string): Promise<PublicHomepageDto> {
    return this.cache.getOrSet(`public:homepage:${tenantId}`, 60, () => this.loadHomepage(tenantId));
  }

  private async loadHomepage(tenantId: string): Promise<PublicHomepageDto> {
    const now = new Date();

    const [homepageBlocks, featuredDestinations, recentPackages, featuredTestimonials, banners, visaFreeCountryIds, recentBookings] = await Promise.all([
      this.prisma.homepageBlock.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.destination.findMany({ where: { tenantId, deletedAt: null, isActive: true, isFeatured: true }, include: DESTINATION_INCLUDE, take: 8 }),
      this.prisma.package.findMany({
        where: { tenantId, deletedAt: null, status: "PUBLISHED" },
        include: PACKAGE_SUMMARY_INCLUDE,
        orderBy: { publishedAt: "desc" },
        take: 8,
      }),
      this.prisma.testimonial.findMany({
        where: { tenantId, deletedAt: null, status: "PUBLISHED" },
        include: TESTIMONIAL_SUMMARY_INCLUDE,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
        take: 8,
      }),
      this.prisma.banner.findMany({
        where: {
          tenantId,
          placement: { in: ["homepage_hero", "homepage_strip"] },
          OR: [{ activeFrom: null }, { activeFrom: { lte: now } }],
        },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.visaInfo.findMany({ where: { visaType: "Visa Free" }, select: { countryId: true } }),
      this.prisma.booking.findMany({
        where: { tenantId, status: { in: ["CONFIRMED", "COMPLETED"] } },
        include: RECENT_BOOKING_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

    const activeBanners = banners.filter((b) => !b.activeTo || b.activeTo >= now);
    const countryIds = visaFreeCountryIds.map((v) => v.countryId);
    const visaFreeDestinations = countryIds.length
      ? await this.prisma.destination.findMany({ where: { tenantId, deletedAt: null, isActive: true, countryId: { in: countryIds } }, include: DESTINATION_INCLUDE, take: 8 })
      : [];

    return {
      homepageBlocks: homepageBlocks.map((b) => ({ id: b.id, type: b.type, configJson: this.resolveHomepageBlockImages(b.type, b.configJson as Record<string, unknown>), sortOrder: b.sortOrder })),
      featuredDestinations: featuredDestinations.map((d) => this.toDestinationDto(d)),
      recentPackages: recentPackages.map((p) => this.toPackageSummaryDto(p)),
      featuredTestimonials: featuredTestimonials.map((t) => this.toTestimonialDto(t)),
      banners: activeBanners.map((b) => this.toBannerDto(b)),
      visaFreeDestinations: visaFreeDestinations.map((d) => this.toDestinationDto(d)),
      recentBookings: recentBookings.map((b) => this.toRecentBookingDto(b)),
    };
  }

  async listDestinations(tenantId: string, category?: string, region?: string, search?: string): Promise<DestinationDto[]> {
    if (!category && !region && !search) {
      return this.cache.getOrSet(`public:destinations:${tenantId}`, 60, () => this.loadDestinations(tenantId));
    }
    return this.loadDestinations(tenantId, category, region, search);
  }

  private async loadDestinations(tenantId: string, category?: string, region?: string, search?: string): Promise<DestinationDto[]> {
    const destinations = await this.prisma.destination.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isActive: true,
        categoryLinks: category ? { some: { category: { name: category } } } : undefined,
        country: region ? { region } : undefined,
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      },
      include: DESTINATION_INCLUDE,
      orderBy: { name: "asc" },
    });
    return destinations.map((d) => this.toDestinationDto(d));
  }

  async getDestinationBySlug(tenantId: string, slug: string): Promise<PublicDestinationDetailDto> {
    const destination = await this.prisma.destination.findFirst({
      where: { tenantId, slug, deletedAt: null, isActive: true },
      include: DESTINATION_INCLUDE,
    });
    if (!destination) {
      throw new NotFoundException({ code: "DESTINATION_NOT_FOUND", message: "Destination does not exist." });
    }
    const categoryIds = destination.categoryLinks.map((l) => l.categoryId);
    const [packages, seo, highlights, activities, hotelSuggestions, faqItems, similarDestinations] = await Promise.all([
      this.prisma.package.findMany({
        where: { tenantId, destinationId: destination.id, deletedAt: null, status: "PUBLISHED" },
        include: PACKAGE_SUMMARY_INCLUDE,
        orderBy: { publishedAt: "desc" },
      }),
      this.getSeo("destination", destination.id),
      this.prisma.destinationHighlight.findMany({ where: { destinationId: destination.id }, orderBy: { sortOrder: "asc" } }),
      this.prisma.destinationActivity.findMany({ where: { destinationId: destination.id }, orderBy: { sortOrder: "asc" } }),
      this.prisma.destinationHotelSuggestion.findMany({ where: { destinationId: destination.id }, orderBy: { sortOrder: "asc" } }),
      this.prisma.faqItem.findMany({ where: { tenantId, entityType: "destination", entityId: destination.id }, orderBy: { sortOrder: "asc" } }),
      categoryIds.length
        ? this.prisma.destination.findMany({
            where: {
              tenantId,
              deletedAt: null,
              isActive: true,
              id: { not: destination.id },
              categoryLinks: { some: { categoryId: { in: categoryIds } } },
            },
            include: DESTINATION_INCLUDE,
            take: 4,
          })
        : [],
    ]);

    const packageDtos = packages.map((p) => this.toPackageSummaryDto(p));
    const durations = packageDtos.map((p) => p.durationDays);
    const idealDurationRange = durations.length
      ? Math.min(...durations) === Math.max(...durations)
        ? `${durations[0]} Days`
        : `${Math.min(...durations)}-${Math.max(...durations)} Days`
      : null;
    const prices = packageDtos.map((p) => p.basePrice);
    const startingFromPrice = prices.length ? Math.min(...prices) : null;

    return {
      ...this.toDestinationDto(destination),
      seo,
      packages: packageDtos,
      highlights,
      activities,
      hotelSuggestions,
      faqItems: faqItems.map((f) => ({ id: f.id, entityType: f.entityType, entityId: f.entityId, question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
      similarDestinations: similarDestinations.map((d) => this.toDestinationDto(d)),
      idealDurationRange,
      startingFromPrice,
    };
  }

  async listPackages(
    tenantId: string,
    filters: {
      destination?: string;
      category?: string;
      minDuration?: number;
      maxDuration?: number;
      minPrice?: number;
      maxPrice?: number;
    },
  ): Promise<PackageSummaryDto[]> {
    const packages = await this.prisma.package.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: "PUBLISHED",
        destination: {
          isActive: true,
          OR: filters.destination
            ? [
                { slug: { equals: filters.destination, mode: "insensitive" } },
                { name: { contains: filters.destination, mode: "insensitive" } },
              ]
            : undefined,
        },
        categoryLinks: filters.category ? { some: { category: { name: filters.category } } } : undefined,
        durationDays: { gte: filters.minDuration, lte: filters.maxDuration },
        basePrice: { gte: filters.minPrice, lte: filters.maxPrice },
      },
      include: PACKAGE_SUMMARY_INCLUDE,
      orderBy: { publishedAt: "desc" },
    });
    return packages.map((p) => this.toPackageSummaryDto(p));
  }

  async getPackageBySlug(tenantId: string, slug: string): Promise<PublicPackageDetailDto> {
    const pkg = await this.prisma.package.findFirst({
      where: { tenantId, slug, deletedAt: null, status: "PUBLISHED" },
      include: PACKAGE_DETAIL_INCLUDE,
    });
    if (!pkg) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Package does not exist." });
    }

    const [reviews, faqItems, similar, seo] = await Promise.all([
      this.prisma.review.findMany({ where: { packageId: pkg.id, status: "APPROVED" }, orderBy: { createdAt: "desc" } }),
      this.prisma.faqItem.findMany({ where: { tenantId, entityType: "package", entityId: pkg.id }, orderBy: { sortOrder: "asc" } }),
      this.prisma.package.findMany({
        where: { tenantId, destinationId: pkg.destinationId, deletedAt: null, status: "PUBLISHED", id: { not: pkg.id } },
        include: PACKAGE_SUMMARY_INCLUDE,
        take: 3,
      }),
      this.getSeo("package", pkg.id),
    ]);

    return {
      ...this.toPackageDetailDto(pkg),
      seo,
      reviews: reviews.map((r) => this.toReviewDto(r, pkg.title)),
      faqItems: faqItems.map((f) => ({ id: f.id, entityType: f.entityType, entityId: f.entityId, question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
      similarPackages: similar.map((p) => this.toPackageSummaryDto(p)),
    };
  }

  async listBlogPosts(tenantId: string, category?: string, search?: string) {
    const posts = await this.prisma.blogPost.findMany({
      where: {
        tenantId,
        status: "PUBLISHED",
        category: category ? category : undefined,
        OR: search
          ? [{ title: { contains: search, mode: "insensitive" } }, { excerpt: { contains: search, mode: "insensitive" } }, { body: { contains: search, mode: "insensitive" } }]
          : undefined,
      },
      orderBy: { publishedAt: "desc" },
    });
    return posts.map((p) => this.toBlogPostDto(p));
  }

  async getBlogPostBySlug(tenantId: string, slug: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { tenantId, slug, status: "PUBLISHED" } });
    if (!post) {
      throw new NotFoundException({ code: "BLOG_POST_NOT_FOUND", message: "Blog post does not exist." });
    }
    const seo = await this.getSeo("blog_post", post.id);
    return { ...this.toBlogPostDto(post), seo };
  }

  async listPages(tenantId: string): Promise<{ title: string; slug: string }[]> {
    const pages = await this.prisma.page.findMany({ where: { tenantId, status: "PUBLISHED" }, select: { title: true, slug: true }, orderBy: { title: "asc" } });
    return pages;
  }

  async getPageBySlug(tenantId: string, slug: string) {
    const page = await this.prisma.page.findFirst({ where: { tenantId, slug, status: "PUBLISHED" } });
    if (!page) {
      throw new NotFoundException({ code: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }
    const seo = await this.getSeo("page", page.id);
    return { id: page.id, title: page.title, slug: page.slug, body: page.body, status: page.status, seo, createdAt: page.createdAt.toISOString(), updatedAt: page.updatedAt.toISOString() };
  }

  private async getSeo(entityType: string, entityId: string) {
    const seo = await this.prisma.seoMeta.findUnique({ where: { entityType_entityId: { entityType, entityId } } });
    if (!seo) return null;
    return {
      title: seo.title,
      description: seo.description,
      ogImageKey: seo.ogImageKey,
      ogImageUrl: this.storage.buildPublicUrl(seo.ogImageKey),
      canonicalUrl: seo.canonicalUrl,
    };
  }

  async listVisaGuide(): Promise<VisaInfoDto[]> {
    const countries = await this.prisma.country.findMany({ include: { visaInfo: true }, orderBy: { name: "asc" } });
    return countries
      .filter((c) => c.visaInfo)
      .map((c) => ({
        countryId: c.id,
        countryName: c.name,
        visaType: c.visaInfo?.visaType ?? null,
        requiredDocuments: c.visaInfo?.requiredDocuments ?? [],
        isVisaFree: c.visaInfo?.isVisaFree ?? false,
        processingTime: c.visaInfo?.processingTime ?? null,
        visaFee: c.visaInfo?.visaFee?.toNumber() ?? null,
        currency: c.visaInfo?.currency ?? null,
        notes: c.visaInfo?.notes ?? null,
        updatedAt: c.visaInfo?.updatedAt.toISOString() ?? null,
      }));
  }

  async listSitemapEntries() {
    return this.prisma.sitemapEntry.findMany({ orderBy: { url: "asc" } });
  }

  async getBranding(tenantId: string): Promise<PublicBrandingDto> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    return {
      siteName: tenant.name,
      logoUrl: this.storage.buildPublicUrl(tenant.logoStorageKey),
      primaryColor: tenant.primaryColor,
      templateSlug: tenant.templateSlug === "modern" ? "modern" : "classic",
      googleLoginEnabled: Boolean(tenant.googleClientId && tenant.googleClientSecretEncrypted),
      ga4MeasurementId: tenant.ga4MeasurementId,
      facebookPixelId: tenant.facebookPixelId,
      googleMapsApiKey: tenant.googleMapsApiKey,
    };
  }

  async getStats(tenantId: string): Promise<PublicStatsDto> {
    const [destinationCount, packageCount, tripsBookedCount, ratingAgg] = await Promise.all([
      this.prisma.destination.count({ where: { tenantId, deletedAt: null, isActive: true } }),
      this.prisma.package.count({ where: { tenantId, deletedAt: null, status: "PUBLISHED" } }),
      this.prisma.booking.count({ where: { tenantId, status: { in: ["CONFIRMED", "COMPLETED"] } } }),
      this.prisma.review.aggregate({ where: { tenantId, status: "APPROVED" }, _avg: { rating: true }, _count: { _all: true } }),
    ]);

    return {
      destinationCount,
      packageCount,
      tripsBookedCount,
      averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
      reviewCount: ratingAgg._count._all,
    };
  }

  private toDestinationDto(destination: Prisma.DestinationGetPayload<{ include: typeof DESTINATION_INCLUDE }>): DestinationDto {
    return {
      id: destination.id,
      countryId: destination.countryId,
      countryName: destination.country.name,
      countryRegion: destination.country.region,
      name: destination.name,
      slug: destination.slug,
      description: destination.description,
      heroImageKey: destination.heroImageKey,
      heroImageUrl: this.storage.buildPublicUrl(destination.heroImageKey),
      isFeatured: destination.isFeatured,
      isActive: destination.isActive,
      bestTimeToVisit: destination.bestTimeToVisit,
      categoryIds: destination.categoryLinks.map((l) => l.categoryId),
      categoryNames: destination.categoryLinks.map((l) => l.category.name),
      seo: null,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
    };
  }

  private toPackageSummaryDto(pkg: Prisma.PackageGetPayload<{ include: typeof PACKAGE_SUMMARY_INCLUDE }>): PackageSummaryDto {
    return {
      id: pkg.id,
      title: pkg.title,
      slug: pkg.slug,
      destinationId: pkg.destinationId,
      destinationName: pkg.destination.name,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      basePrice: pkg.basePrice.toNumber(),
      status: pkg.status,
      publishedAt: pkg.publishedAt?.toISOString() ?? null,
      coverImageUrl: this.storage.buildPublicUrl(pkg.galleryImages[0]?.storageKey),
      inclusions: pkg.inclusions,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      categoryIds: pkg.categoryLinks.map((l) => l.categoryId),
      categoryNames: pkg.categoryLinks.map((l) => l.category.name),
      avgRating: pkg.reviews.length ? Math.round((pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length) * 10) / 10 : null,
      reviewCount: pkg.reviews.length,
    };
  }

  private toPackageDetailDto(pkg: Prisma.PackageGetPayload<{ include: typeof PACKAGE_DETAIL_INCLUDE }>) {
    return {
      ...this.toPackageSummaryDto(pkg),
      templateHintSlug: pkg.templateHintSlug,
      itineraryDays: pkg.itineraryDays.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description ?? undefined,
        activities: day.activities.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description ?? undefined,
          isOptional: a.isOptional,
          timeLabel: a.timeLabel ?? undefined,
          imageStorageKey: a.imageStorageKey ?? undefined,
          imageUrl: this.storage.buildPublicUrl(a.imageStorageKey) ?? undefined,
        })),
        location: day.location ?? undefined,
        mealsIncluded: day.mealsIncluded,
        notes: day.notes ?? undefined,
        imageStorageKey: day.imageStorageKey ?? undefined,
        imageUrl: this.storage.buildPublicUrl(day.imageStorageKey) ?? undefined,
      })),
      hotels: pkg.hotels.map((h) => ({
        id: h.id,
        cityName: h.cityName,
        roomType: h.roomType ?? undefined,
        mealPlan: h.mealPlan ?? undefined,
        checkInDay: h.checkInDay,
        checkOutDay: h.checkOutDay,
        imageStorageKey: h.imageStorageKey ?? undefined,
        imageUrl: this.storage.buildPublicUrl(h.imageStorageKey) ?? undefined,
      })),
      flights: pkg.flights.map((f) => ({
        id: f.id,
        sector: f.sector,
        carrierName: f.carrierName ?? undefined,
        isIncluded: f.isIncluded,
        dayNumber: f.dayNumber ?? undefined,
      })),
      pricingTiers: pkg.pricingTiers.map((t) => ({ id: t.id, name: t.name, basePrice: t.basePrice.toNumber(), currency: t.currency })),
      seasonalRates: pkg.seasonalRates.map((r) => ({
        id: r.id,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        priceModifierType: r.priceModifierType,
        value: r.value.toNumber(),
      })),
      galleryImages: pkg.galleryImages.map((g) => ({ id: g.id, storageKey: g.storageKey, imageUrl: this.storage.buildPublicUrl(g.storageKey) ?? undefined, sortOrder: g.sortOrder })),
      routeMapPoints: pkg.routeMapPoints.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, sortOrder: p.sortOrder, label: p.label ?? undefined })),
      seo: null,
    };
  }

  private toRecentBookingDto(b: Prisma.BookingGetPayload<{ include: typeof RECENT_BOOKING_INCLUDE }>): RecentBookingDto {
    return {
      id: b.id,
      customerFirstName: b.customer.name.split(" ")[0] ?? b.customer.name,
      packageTitle: b.package.title,
      packageSlug: b.package.slug,
      destinationName: b.package.destination.name,
      categoryName: b.package.categoryLinks[0]?.category.name ?? null,
      coverImageUrl: this.storage.buildPublicUrl(b.package.galleryImages[0]?.storageKey),
      price: b.totalAmount.toNumber(),
      durationNights: b.package.durationNights,
      bookedAt: b.createdAt.toISOString(),
    };
  }

  async getTestimonialBySlug(tenantId: string, slug: string): Promise<TestimonialDto> {
    const testimonial = await this.prisma.testimonial.findFirst({
      where: { tenantId, slug, deletedAt: null, status: "PUBLISHED" },
      include: TESTIMONIAL_SUMMARY_INCLUDE,
    });
    if (!testimonial) {
      throw new NotFoundException({ code: "TESTIMONIAL_NOT_FOUND", message: "Testimonial does not exist." });
    }
    return this.toTestimonialDto(testimonial);
  }

  private toTestimonialDto(t: Prisma.TestimonialGetPayload<{ include: typeof TESTIMONIAL_SUMMARY_INCLUDE }>): TestimonialDto {
    return {
      id: t.id,
      customerName: t.customerName,
      rating: t.rating,
      content: t.content,
      imageKey: t.imageKey,
      imageUrl: this.storage.buildPublicUrl(t.imageKey),
      isFeatured: t.isFeatured,
      slug: t.slug,
      title: t.title,
      tripTitle: t.tripTitle,
      destinationId: t.destinationId,
      destinationName: t.destination?.name ?? null,
      packageId: t.packageId,
      packageTitle: t.package?.title ?? null,
      videoKey: t.videoKey,
      videoUrl: this.storage.buildPublicUrl(t.videoKey),
      posterKey: t.posterKey,
      posterUrl: this.storage.buildPublicUrl(t.posterKey),
      durationSeconds: t.durationSeconds,
      testimonialDate: t.testimonialDate?.toISOString() ?? null,
      sortOrder: t.sortOrder,
      status: t.status,
      publishedAt: t.publishedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  /** "who_coming_along" (and any future block type with per-item images) stores a storageKey, not a URL — resolve it here so the frontend never has to know about the storage layer. */
  private resolveHomepageBlockImages(type: string, configJson: Record<string, unknown>): Record<string, unknown> {
    if (type !== "who_coming_along" || !Array.isArray(configJson.items)) return configJson;
    const items = (configJson.items as Array<Record<string, unknown>>).map((item) => ({
      ...item,
      imageUrl: this.storage.buildPublicUrl(item.imageKey as string | undefined),
    }));
    return { ...configJson, items };
  }

  private toBannerDto(b: { id: string; imageKey: string; linkUrl: string | null; placement: string; sortOrder: number; activeFrom: Date | null; activeTo: Date | null }): BannerDto {
    return {
      id: b.id,
      imageKey: b.imageKey,
      imageUrl: this.storage.buildPublicUrl(b.imageKey) ?? "",
      linkUrl: b.linkUrl,
      placement: b.placement,
      sortOrder: b.sortOrder,
      activeFrom: b.activeFrom?.toISOString() ?? null,
      activeTo: b.activeTo?.toISOString() ?? null,
    };
  }

  private toReviewDto(
    r: { id: string; packageId: string; customerId: string | null; authorName: string; rating: number; title: string | null; comment: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: Date },
    packageTitle: string,
  ): ReviewDto {
    return {
      id: r.id,
      packageId: r.packageId,
      packageTitle,
      customerId: r.customerId,
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private toBlogPostDto(post: {
    id: string;
    title: string;
    slug: string;
    body: string;
    excerpt: string | null;
    category: string | null;
    readMinutes: number | null;
    coverImageKey: string | null;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      body: post.body,
      excerpt: post.excerpt,
      category: post.category,
      readMinutes: post.readMinutes,
      coverImageKey: post.coverImageKey,
      coverImageUrl: this.storage.buildPublicUrl(post.coverImageKey),
      status: post.status,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      seo: null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
