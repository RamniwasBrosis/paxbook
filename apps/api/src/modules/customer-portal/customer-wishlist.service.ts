import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { WishlistItemDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";

const INCLUDE = {
  package: { include: { galleryImages: { orderBy: { sortOrder: "asc" }, take: 1 } } },
} satisfies Prisma.WishlistItemInclude;
type Row = Prisma.WishlistItemGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class CustomerWishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async list(tenantId: string, customerId: string): Promise<WishlistItemDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { tenantId, customerId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return items.map((i) => this.toDto(i));
  }

  async add(tenantId: string, customerId: string, packageId: string): Promise<WishlistItemDto> {
    const pkg = await this.prisma.package.findFirst({ where: { id: packageId, tenantId, deletedAt: null } });
    if (!pkg) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Package does not exist." });
    }
    const item = await this.prisma.wishlistItem.upsert({
      where: { customerId_packageId: { customerId, packageId } },
      update: {},
      create: { tenantId, customerId, packageId },
      include: INCLUDE,
    });
    return this.toDto(item);
  }

  async remove(tenantId: string, customerId: string, packageId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({ where: { tenantId, customerId, packageId } });
  }

  private toDto(item: Row): WishlistItemDto {
    return {
      id: item.id,
      packageId: item.packageId,
      packageTitle: item.package.title,
      packageSlug: item.package.slug,
      packageCoverImageUrl: this.storageService.buildPublicUrl(item.package.galleryImages[0]?.storageKey),
      basePrice: item.package.basePrice.toNumber(),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
