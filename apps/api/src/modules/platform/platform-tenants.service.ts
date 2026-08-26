import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { TenantSummaryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { UpdateTenantStatusDto } from "./dto/update-tenant-status.dto";

const INCLUDE = { subscription: { include: { plan: true } } } satisfies Prisma.TenantInclude;
type Row = Prisma.TenantGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class PlatformTenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TenantSummaryDto[]> {
    const tenants = await this.prisma.tenant.findMany({ include: INCLUDE, orderBy: { createdAt: "desc" } });
    return tenants.map(toDto);
  }

  async updateStatus(id: string, dto: UpdateTenantStatusDto): Promise<TenantSummaryDto> {
    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "TENANT_NOT_FOUND", message: "Tenant does not exist." });
    }
    const updated = await this.prisma.tenant.update({ where: { id }, data: { status: dto.status }, include: INCLUDE });
    return toDto(updated);
  }
}

function toDto(t: Row): TenantSummaryDto {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    templateSlug: t.templateSlug,
    customDomain: t.customDomain,
    createdAt: t.createdAt.toISOString(),
    planName: t.subscription?.plan.name ?? null,
    subscriptionStatus: t.subscription?.status ?? null,
  };
}
