import { Injectable, NotFoundException, type NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NextFunction, Request, Response } from "express";
import { DEFAULT_TENANT_SLUG } from "@paxbook/config";
import { PrismaService } from "../prisma/prisma.service";
import type { ResolvedTenant } from "../types/resolved-tenant";

/**
 * Resolves the tenant for public-facing, not-yet-authenticated routes (public/*,
 * customer-auth/*, vendor-auth/*, platform/tenants/signup) — everything else already
 * gets its tenant from the caller's JWT, so this middleware is scoped to only those
 * routes in AppModule.configure() rather than running globally.
 *
 * Resolution order: X-Tenant-Slug header (what a reverse proxy would set from the real
 * subdomain in production) -> exact custom-domain match on Host -> subdomain match
 * against TENANT_BASE_DOMAIN -> the seeded default tenant.
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const headerSlug = req.header("x-tenant-slug");
    const host = (req.header("host") ?? "").split(":")[0];
    const baseDomain = this.configService.get<string>("TENANT_BASE_DOMAIN", "localhost");

    let tenant: ResolvedTenant | null = null;

    if (headerSlug) {
      tenant = await this.prisma.tenant.findUnique({ where: { slug: headerSlug } });
    }
    if (!tenant && host) {
      tenant = await this.prisma.tenant.findFirst({ where: { customDomain: host } });
    }
    if (!tenant && host && host !== baseDomain && host.endsWith(`.${baseDomain}`)) {
      const subdomain = host.slice(0, -(baseDomain.length + 1));
      tenant = await this.prisma.tenant.findUnique({ where: { slug: subdomain } });
    }
    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } });
    }
    if (!tenant) {
      throw new NotFoundException({ code: "TENANT_NOT_FOUND", message: "This site is not configured." });
    }

    (req as Request & { tenant: ResolvedTenant }).tenant = tenant;
    next();
  }
}
