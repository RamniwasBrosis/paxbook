import { Injectable } from "@nestjs/common";
import { DEFAULT_TENANT_SLUG } from "@paxbook/config";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Phase 1 runs a single seeded tenant, resolved once and memoized. Phase 4
 * replaces `getDefaultTenantId()` call sites with a request-scoped resolver
 * keyed off subdomain/host — every tenant-scoped module already depends on
 * this service rather than a hardcoded id, so that swap doesn't touch them.
 */
@Injectable()
export class TenantContextService {
  private cachedTenantId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getDefaultTenantId(): Promise<string> {
    if (this.cachedTenantId) return this.cachedTenantId;

    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { slug: DEFAULT_TENANT_SLUG },
    });
    this.cachedTenantId = tenant.id;
    return tenant.id;
  }
}
