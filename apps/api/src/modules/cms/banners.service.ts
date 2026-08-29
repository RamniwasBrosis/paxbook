import { Injectable, NotFoundException } from "@nestjs/common";
import type { BannerDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CacheService } from "../../common/cache/cache.service";
import type { SaveBannerDto } from "./dto/save-banner.dto";

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cache: CacheService,
  ) {}

  async findAll(tenantId: string): Promise<BannerDto[]> {
    const banners = await this.prisma.banner.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } });
    return banners.map((b) => this.toDto(b));
  }

  async create(tenantId: string, dto: SaveBannerDto): Promise<BannerDto> {
    const created = await this.prisma.banner.create({
      data: {
        tenantId,
        imageKey: dto.imageKey,
        title: dto.title,
        description: dto.description,
        ctaText: dto.ctaText,
        linkUrl: dto.linkUrl,
        placement: dto.placement,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        activeFrom: dto.activeFrom ? new Date(dto.activeFrom) : undefined,
        activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
      },
    });
    await this.cache.invalidate(`public:homepage:${tenantId}`);
    return this.toDto(created);
  }

  async update(tenantId: string, id: string, dto: SaveBannerDto): Promise<BannerDto> {
    await this.assertOwned(tenantId, id);
    const updated = await this.prisma.banner.update({
      where: { id },
      data: {
        imageKey: dto.imageKey,
        title: dto.title,
        description: dto.description,
        ctaText: dto.ctaText,
        linkUrl: dto.linkUrl,
        placement: dto.placement,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        activeFrom: dto.activeFrom ? new Date(dto.activeFrom) : undefined,
        activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
      },
    });
    await this.cache.invalidate(`public:homepage:${tenantId}`);
    return this.toDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.banner.delete({ where: { id } });
    await this.cache.invalidate(`public:homepage:${tenantId}`);
  }

  private async assertOwned(tenantId: string, id: string): Promise<void> {
    const banner = await this.prisma.banner.findFirst({ where: { id, tenantId } });
    if (!banner) {
      throw new NotFoundException({ code: "BANNER_NOT_FOUND", message: "Banner does not exist." });
    }
  }

  private toDto(banner: {
    id: string;
    imageKey: string;
    title: string | null;
    description: string | null;
    ctaText: string | null;
    linkUrl: string | null;
    placement: string;
    sortOrder: number;
    isActive: boolean;
    activeFrom: Date | null;
    activeTo: Date | null;
  }): BannerDto {
    return {
      id: banner.id,
      imageKey: banner.imageKey,
      imageUrl: this.storageService.buildPublicUrl(banner.imageKey) ?? "",
      title: banner.title,
      description: banner.description,
      ctaText: banner.ctaText,
      linkUrl: banner.linkUrl,
      placement: banner.placement,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      activeFrom: banner.activeFrom?.toISOString() ?? null,
      activeTo: banner.activeTo?.toISOString() ?? null,
    };
  }
}
