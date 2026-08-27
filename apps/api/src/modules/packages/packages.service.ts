import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PackageDetailDto, PackageSummaryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { upsertSeoMeta } from "../../common/seo/upsert-seo-meta";
import type { SavePackageDto } from "./dto/save-package.dto";

const ENTITY_TYPE = "package";

const PACKAGE_LIST_INCLUDE = {
  destination: true,
  galleryImages: { orderBy: { sortOrder: "asc" }, take: 1 },
  categoryLinks: { include: { category: true } },
} satisfies Prisma.PackageInclude;

const PACKAGE_DETAIL_INCLUDE = {
  destination: true,
  itineraryDays: { include: { activities: true }, orderBy: { dayNumber: "asc" } },
  hotels: true,
  flights: true,
  pricingTiers: true,
  seasonalRates: true,
  galleryImages: { orderBy: { sortOrder: "asc" } },
  routeMapPoints: { orderBy: { sortOrder: "asc" } },
  categoryLinks: { include: { category: true } },
} satisfies Prisma.PackageInclude;

type PackageListRow = Prisma.PackageGetPayload<{ include: typeof PACKAGE_LIST_INCLUDE }>;
type PackageDetailRow = Prisma.PackageGetPayload<{ include: typeof PACKAGE_DETAIL_INCLUDE }>;

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<PackageSummaryDto[]> {
    const packages = await this.prisma.package.findMany({
      where: { tenantId, deletedAt: null },
      include: PACKAGE_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return packages.map((p) => this.toSummaryDto(p));
  }

  async findOne(tenantId: string, id: string): Promise<PackageDetailDto> {
    const pkg = await this.getOwnedDetail(tenantId, id);
    const seo = await this.prisma.seoMeta.findUnique({
      where: { entityType_entityId: { entityType: ENTITY_TYPE, entityId: id } },
    });
    return this.toDetailDto(pkg, seo);
  }

  async create(tenantId: string, dto: SavePackageDto, canApprove: boolean): Promise<PackageDetailDto> {
    if (dto.status === "PUBLISHED" && !canApprove) {
      throw new ForbiddenException({ code: "APPROVAL_REQUIRED", message: "Only a Super Admin can publish a package." });
    }

    let created: { id: string };
    try {
      created = await this.prisma.package.create({
        data: {
          tenantId,
          destinationId: dto.destinationId,
          title: dto.title,
          slug: dto.slug,
          durationDays: dto.durationDays,
          durationNights: dto.durationNights,
          basePrice: dto.basePrice,
          status: dto.status ?? "DRAFT",
          templateHintSlug: dto.templateHintSlug,
          inclusions: dto.inclusions ?? [],
          publishedAt: dto.status === "PUBLISHED" ? new Date() : null,
          ...this.buildChildrenCreateInput(dto),
        },
        select: { id: true },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, created.id, dto.seo);
    if (dto.status === "PUBLISHED") {
      await this.upsertSitemapEntry(dto.slug);
    }
    return this.findOne(tenantId, created.id);
  }

  async update(tenantId: string, id: string, dto: SavePackageDto, canApprove: boolean): Promise<PackageDetailDto> {
    const existing = await this.getOwnedDetail(tenantId, id);
    const wasPublished = existing.status === "PUBLISHED";
    const willBePublished = (dto.status ?? existing.status) === "PUBLISHED";

    if (willBePublished !== wasPublished && !canApprove) {
      throw new ForbiddenException({ code: "APPROVAL_REQUIRED", message: "Only a Super Admin can publish or unpublish a package." });
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.itineraryDay.deleteMany({ where: { packageId: id } }); // cascades to package_activities
        await tx.packageHotel.deleteMany({ where: { packageId: id } });
        await tx.packageFlight.deleteMany({ where: { packageId: id } });
        await tx.packagePricingTier.deleteMany({ where: { packageId: id } });
        await tx.seasonalRate.deleteMany({ where: { packageId: id } });
        await tx.packageGalleryImage.deleteMany({ where: { packageId: id } });
        await tx.packageRouteMapPoint.deleteMany({ where: { packageId: id } });
        await tx.packageCategoryMap.deleteMany({ where: { packageId: id } });

        await tx.package.update({
          where: { id },
          data: {
            destinationId: dto.destinationId,
            title: dto.title,
            slug: dto.slug,
            durationDays: dto.durationDays,
            durationNights: dto.durationNights,
            basePrice: dto.basePrice,
            status: dto.status ?? existing.status,
            templateHintSlug: dto.templateHintSlug,
            inclusions: dto.inclusions ?? [],
            publishedAt: willBePublished ? (wasPublished ? undefined : new Date()) : null,
            ...this.buildChildrenCreateInput(dto),
          },
        });
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, id, dto.seo);

    if (willBePublished) {
      await this.upsertSitemapEntry(dto.slug);
    } else if (wasPublished && !willBePublished) {
      await this.removeSitemapEntry(existing.slug);
    }

    return this.findOne(tenantId, id);
  }

  async setPublished(tenantId: string, id: string, published: boolean): Promise<PackageDetailDto> {
    const existing = await this.getOwnedDetail(tenantId, id);
    await this.prisma.package.update({
      where: { id },
      data: {
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
      },
    });

    if (published) {
      await this.upsertSitemapEntry(existing.slug);
    } else {
      await this.removeSitemapEntry(existing.slug);
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const existing = await this.getOwnedDetail(tenantId, id);
    await this.prisma.package.update({ where: { id }, data: { deletedAt: new Date() } });
    if (existing.status === "PUBLISHED") {
      await this.removeSitemapEntry(existing.slug);
    }
  }

  private buildChildrenCreateInput(dto: SavePackageDto) {
    return {
      itineraryDays: {
        create: dto.itineraryDays.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          location: day.location,
          mealsIncluded: day.mealsIncluded ?? [],
          notes: day.notes,
          imageStorageKey: day.imageStorageKey,
          activities: {
            create: (day.activities ?? []).map((activity) => ({
              name: activity.name,
              description: activity.description,
              isOptional: activity.isOptional ?? false,
              activityVendorId: activity.activityVendorId,
              timeLabel: activity.timeLabel,
              imageStorageKey: activity.imageStorageKey,
            })),
          },
        })),
      },
      hotels: {
        create: dto.hotels.map((hotel) => ({
          cityName: hotel.cityName,
          hotelVendorId: hotel.hotelVendorId,
          roomType: hotel.roomType,
          mealPlan: hotel.mealPlan,
          checkInDay: hotel.checkInDay,
          checkOutDay: hotel.checkOutDay,
          imageStorageKey: hotel.imageStorageKey,
        })),
      },
      flights: {
        create: dto.flights.map((flight) => ({
          sector: flight.sector,
          carrierName: flight.carrierName,
          isIncluded: flight.isIncluded ?? true,
          dayNumber: flight.dayNumber,
        })),
      },
      pricingTiers: {
        create: dto.pricingTiers.map((tier) => ({
          name: tier.name,
          basePrice: tier.basePrice,
          currency: tier.currency ?? "INR",
        })),
      },
      seasonalRates: {
        create: dto.seasonalRates.map((rate) => ({
          startDate: new Date(rate.startDate),
          endDate: new Date(rate.endDate),
          priceModifierType: rate.priceModifierType,
          value: rate.value,
        })),
      },
      galleryImages: {
        create: dto.galleryImages.map((image, index) => ({
          storageKey: image.storageKey,
          sortOrder: image.sortOrder ?? index,
        })),
      },
      routeMapPoints: {
        create: dto.routeMapPoints.map((point, index) => ({
          lat: point.lat,
          lng: point.lng,
          sortOrder: point.sortOrder ?? index,
          label: point.label,
        })),
      },
      categoryLinks: {
        create: (dto.categoryIds ?? []).map((categoryId) => ({ categoryId })),
      },
    };
  }

  private async getOwnedDetail(tenantId: string, id: string): Promise<PackageDetailRow> {
    const pkg = await this.prisma.package.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: PACKAGE_DETAIL_INCLUDE,
    });
    if (!pkg) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Package does not exist." });
    }
    return pkg;
  }

  private async upsertSitemapEntry(slug: string): Promise<void> {
    const url = `/packages/${slug}`;
    await this.prisma.sitemapEntry.upsert({
      where: { url },
      update: { lastModified: new Date() },
      create: { url, lastModified: new Date(), priority: 0.8 },
    });
  }

  private async removeSitemapEntry(slug: string): Promise<void> {
    await this.prisma.sitemapEntry.deleteMany({ where: { url: `/packages/${slug}` } });
  }

  private toSummaryDto(pkg: PackageListRow): PackageSummaryDto {
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
      coverImageUrl: this.storageService.buildPublicUrl(pkg.galleryImages[0]?.storageKey),
      inclusions: pkg.inclusions,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      categoryIds: pkg.categoryLinks.map((link) => link.categoryId),
      categoryNames: pkg.categoryLinks.map((link) => link.category.name),
    };
  }

  private toDetailDto(
    pkg: PackageDetailRow,
    seo: { title: string | null; description: string | null; ogImageKey: string | null; canonicalUrl: string | null } | null,
  ): PackageDetailDto {
    return {
      ...this.toSummaryDto(pkg),
      templateHintSlug: pkg.templateHintSlug,
      itineraryDays: pkg.itineraryDays.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description ?? undefined,
        activities: day.activities.map((activity) => ({
          id: activity.id,
          name: activity.name,
          description: activity.description ?? undefined,
          isOptional: activity.isOptional,
          activityVendorId: activity.activityVendorId ?? undefined,
          timeLabel: activity.timeLabel ?? undefined,
          imageStorageKey: activity.imageStorageKey ?? undefined,
          imageUrl: this.storageService.buildPublicUrl(activity.imageStorageKey) ?? undefined,
        })),
        location: day.location ?? undefined,
        mealsIncluded: day.mealsIncluded,
        notes: day.notes ?? undefined,
        imageStorageKey: day.imageStorageKey ?? undefined,
        imageUrl: this.storageService.buildPublicUrl(day.imageStorageKey) ?? undefined,
      })),
      hotels: pkg.hotels.map((hotel) => ({
        id: hotel.id,
        cityName: hotel.cityName,
        hotelVendorId: hotel.hotelVendorId ?? undefined,
        roomType: hotel.roomType ?? undefined,
        mealPlan: hotel.mealPlan ?? undefined,
        checkInDay: hotel.checkInDay,
        checkOutDay: hotel.checkOutDay,
        imageStorageKey: hotel.imageStorageKey ?? undefined,
        imageUrl: this.storageService.buildPublicUrl(hotel.imageStorageKey) ?? undefined,
      })),
      flights: pkg.flights.map((flight) => ({
        id: flight.id,
        sector: flight.sector,
        carrierName: flight.carrierName ?? undefined,
        isIncluded: flight.isIncluded,
        dayNumber: flight.dayNumber ?? undefined,
      })),
      pricingTiers: pkg.pricingTiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        basePrice: tier.basePrice.toNumber(),
        currency: tier.currency,
      })),
      seasonalRates: pkg.seasonalRates.map((rate) => ({
        id: rate.id,
        startDate: rate.startDate.toISOString(),
        endDate: rate.endDate.toISOString(),
        priceModifierType: rate.priceModifierType,
        value: rate.value.toNumber(),
      })),
      galleryImages: pkg.galleryImages.map((image) => ({
        id: image.id,
        storageKey: image.storageKey,
        imageUrl: this.storageService.buildPublicUrl(image.storageKey) ?? undefined,
        sortOrder: image.sortOrder,
      })),
      routeMapPoints: pkg.routeMapPoints.map((point) => ({
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        sortOrder: point.sortOrder,
        label: point.label ?? undefined,
      })),
      seo: seo
        ? {
            title: seo.title,
            description: seo.description,
            ogImageKey: seo.ogImageKey,
            ogImageUrl: this.storageService.buildPublicUrl(seo.ogImageKey),
            canonicalUrl: seo.canonicalUrl,
          }
        : null,
    };
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({
        code: "PACKAGE_SLUG_TAKEN",
        message: "A package with this slug already exists.",
      });
    }
    return err as Error;
  }
}
