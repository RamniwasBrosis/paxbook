import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { TenantBrandingDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { UpdateTenantBrandingDto } from "./dto/update-tenant-branding.dto";

@Injectable()
export class TenantBrandingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getBranding(tenantId: string): Promise<TenantBrandingDto> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    return this.toDto(tenant);
  }

  async updateBranding(tenantId: string, dto: UpdateTenantBrandingDto): Promise<TenantBrandingDto> {
    try {
      const tenant = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          logoStorageKey: dto.logoStorageKey,
          primaryColor: dto.primaryColor,
          templateSlug: dto.templateSlug,
          customDomain: dto.customDomain,
        },
      });
      return this.toDto(tenant);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException({ code: "CUSTOM_DOMAIN_TAKEN", message: "Another tenant already uses this custom domain." });
      }
      throw err;
    }
  }

  private toDto(tenant: { name: string; slug: string; logoStorageKey: string | null; primaryColor: string | null; templateSlug: string; customDomain: string | null }): TenantBrandingDto {
    return {
      siteName: tenant.name,
      logoStorageKey: tenant.logoStorageKey,
      logoUrl: this.storageService.buildPublicUrl(tenant.logoStorageKey),
      primaryColor: tenant.primaryColor,
      templateSlug: tenant.templateSlug === "modern" ? "modern" : "classic",
      slug: tenant.slug,
      customDomain: tenant.customDomain,
    };
  }
}
