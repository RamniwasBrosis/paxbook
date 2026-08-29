import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CountryDto,
  DestinationActivityDto,
  DestinationDto,
  DestinationHighlightDto,
  DestinationHotelSuggestionDto,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CacheService } from "../../common/cache/cache.service";
import { upsertSeoMeta } from "../../common/seo/upsert-seo-meta";
import type { CreateDestinationDto } from "./dto/create-destination.dto";
import type { UpdateDestinationDto } from "./dto/update-destination.dto";
import type {
  SaveDestinationActivityDto,
  SaveDestinationHighlightDto,
  SaveDestinationHotelSuggestionDto,
} from "./dto/destination-content.dto";

const ENTITY_TYPE = "destination";

const DESTINATION_INCLUDE = {
  country: true,
  categoryLinks: { include: { category: true } },
} satisfies Prisma.DestinationInclude;

type DestinationWithRelations = Prisma.DestinationGetPayload<{ include: typeof DESTINATION_INCLUDE }>;

@Injectable()
export class DestinationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cache: CacheService,
  ) {}

  private invalidateCaches(tenantId: string): Promise<void> {
    return this.cache.invalidate([`public:homepage:${tenantId}`, `public:destinations:${tenantId}`]);
  }

  async listCountries(): Promise<CountryDto[]> {
    return this.prisma.country.findMany({ orderBy: { name: "asc" } });
  }

  async findAll(tenantId: string): Promise<DestinationDto[]> {
    const destinations = await this.prisma.destination.findMany({
      where: { tenantId, deletedAt: null },
      include: DESTINATION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    const seoByEntityId = await this.fetchSeoMap(destinations.map((d) => d.id));
    return destinations.map((d) => this.toDto(d, seoByEntityId.get(d.id) ?? null));
  }

  async findOne(tenantId: string, id: string): Promise<DestinationDto> {
    const destination = await this.getOwned(tenantId, id);
    const seo = await this.prisma.seoMeta.findUnique({
      where: { entityType_entityId: { entityType: ENTITY_TYPE, entityId: id } },
    });
    return this.toDto(destination, seo);
  }

  async create(tenantId: string, dto: CreateDestinationDto): Promise<DestinationDto> {
    let created: DestinationWithRelations;
    try {
      created = await this.prisma.destination.create({
        data: {
          tenantId,
          countryId: dto.countryId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          heroImageKey: dto.heroImageKey,
          isFeatured: dto.isFeatured ?? false,
          isActive: dto.isActive ?? true,
          bestTimeToVisit: dto.bestTimeToVisit,
          categoryLinks: dto.categoryIds?.length
            ? { create: dto.categoryIds.map((categoryId) => ({ categoryId })) }
            : undefined,
        },
        include: DESTINATION_INCLUDE,
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, created.id, dto.seo);
    await this.invalidateCaches(tenantId);
    return this.findOne(tenantId, created.id);
  }

  async update(tenantId: string, id: string, dto: UpdateDestinationDto): Promise<DestinationDto> {
    await this.getOwned(tenantId, id);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.destination.update({
          where: { id },
          data: {
            countryId: dto.countryId,
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            heroImageKey: dto.heroImageKey,
            isFeatured: dto.isFeatured,
            isActive: dto.isActive,
            bestTimeToVisit: dto.bestTimeToVisit,
          },
        });

        if (dto.categoryIds) {
          await tx.destinationCategoryMap.deleteMany({ where: { destinationId: id } });
          if (dto.categoryIds.length > 0) {
            await tx.destinationCategoryMap.createMany({
              data: dto.categoryIds.map((categoryId) => ({ destinationId: id, categoryId })),
            });
          }
        }
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, id, dto.seo);
    await this.invalidateCaches(tenantId);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.destination.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.invalidateCaches(tenantId);
  }

  // --- Highlights ("things to do") ---

  async listHighlights(tenantId: string, destinationId: string): Promise<DestinationHighlightDto[]> {
    await this.getOwned(tenantId, destinationId);
    const rows = await this.prisma.destinationHighlight.findMany({ where: { destinationId }, orderBy: { sortOrder: "asc" } });
    return rows;
  }

  async createHighlight(tenantId: string, destinationId: string, dto: SaveDestinationHighlightDto): Promise<DestinationHighlightDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationHighlight.create({
      data: { destinationId, title: dto.title, description: dto.description, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async updateHighlight(tenantId: string, destinationId: string, id: string, dto: SaveDestinationHighlightDto): Promise<DestinationHighlightDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationHighlight.update({
      where: { id },
      data: { title: dto.title, description: dto.description, sortOrder: dto.sortOrder },
    });
  }

  async removeHighlight(tenantId: string, destinationId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, destinationId);
    await this.prisma.destinationHighlight.delete({ where: { id } });
  }

  // --- Activities ("activities we can add") ---

  async listActivities(tenantId: string, destinationId: string): Promise<DestinationActivityDto[]> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationActivity.findMany({ where: { destinationId }, orderBy: { sortOrder: "asc" } });
  }

  async createActivity(tenantId: string, destinationId: string, dto: SaveDestinationActivityDto): Promise<DestinationActivityDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationActivity.create({ data: { destinationId, label: dto.label, sortOrder: dto.sortOrder ?? 0 } });
  }

  async updateActivity(tenantId: string, destinationId: string, id: string, dto: SaveDestinationActivityDto): Promise<DestinationActivityDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationActivity.update({ where: { id }, data: { label: dto.label, sortOrder: dto.sortOrder } });
  }

  async removeActivity(tenantId: string, destinationId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, destinationId);
    await this.prisma.destinationActivity.delete({ where: { id } });
  }

  // --- Hotel suggestions ("where you could stay") ---

  async listHotelSuggestions(tenantId: string, destinationId: string): Promise<DestinationHotelSuggestionDto[]> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationHotelSuggestion.findMany({ where: { destinationId }, orderBy: { sortOrder: "asc" } });
  }

  async createHotelSuggestion(
    tenantId: string,
    destinationId: string,
    dto: SaveDestinationHotelSuggestionDto,
  ): Promise<DestinationHotelSuggestionDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationHotelSuggestion.create({
      data: {
        destinationId,
        name: dto.name,
        starRating: dto.starRating,
        area: dto.area,
        descriptor: dto.descriptor,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateHotelSuggestion(
    tenantId: string,
    destinationId: string,
    id: string,
    dto: SaveDestinationHotelSuggestionDto,
  ): Promise<DestinationHotelSuggestionDto> {
    await this.getOwned(tenantId, destinationId);
    return this.prisma.destinationHotelSuggestion.update({
      where: { id },
      data: { name: dto.name, starRating: dto.starRating, area: dto.area, descriptor: dto.descriptor, sortOrder: dto.sortOrder },
    });
  }

  async removeHotelSuggestion(tenantId: string, destinationId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, destinationId);
    await this.prisma.destinationHotelSuggestion.delete({ where: { id } });
  }

  private async getOwned(tenantId: string, id: string): Promise<DestinationWithRelations> {
    const destination = await this.prisma.destination.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: DESTINATION_INCLUDE,
    });
    if (!destination) {
      throw new NotFoundException({ code: "DESTINATION_NOT_FOUND", message: "Destination does not exist." });
    }
    return destination;
  }

  private async fetchSeoMap(entityIds: string[]) {
    if (entityIds.length === 0) return new Map();
    const rows = await this.prisma.seoMeta.findMany({
      where: { entityType: ENTITY_TYPE, entityId: { in: entityIds } },
    });
    return new Map(rows.map((row) => [row.entityId, row]));
  }

  private toDto(
    destination: DestinationWithRelations,
    seo: { title: string | null; description: string | null; ogImageKey: string | null; canonicalUrl: string | null } | null,
  ): DestinationDto {
    return {
      id: destination.id,
      countryId: destination.countryId,
      countryName: destination.country.name,
      countryRegion: destination.country.region,
      name: destination.name,
      slug: destination.slug,
      description: destination.description,
      heroImageKey: destination.heroImageKey,
      heroImageUrl: this.storageService.buildPublicUrl(destination.heroImageKey),
      isFeatured: destination.isFeatured,
      isActive: destination.isActive,
      bestTimeToVisit: destination.bestTimeToVisit,
      categoryIds: destination.categoryLinks.map((link) => link.categoryId),
      categoryNames: destination.categoryLinks.map((link) => link.category.name),
      seo: seo
        ? {
            title: seo.title,
            description: seo.description,
            ogImageKey: seo.ogImageKey,
            ogImageUrl: this.storageService.buildPublicUrl(seo.ogImageKey),
            canonicalUrl: seo.canonicalUrl,
          }
        : null,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
    };
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({
        code: "DESTINATION_SLUG_TAKEN",
        message: "A destination with this slug already exists.",
      });
    }
    return err as Error;
  }
}
