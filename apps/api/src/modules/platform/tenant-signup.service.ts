import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { DEFAULT_TENANT_SLUG } from "@paxbook/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { seedTenantRolesAndPermissions } from "../../common/tenant/seed-tenant-defaults";
import { AuthService, type IssuedTokens } from "../auth/auth.service";
import type { SignupTenantDto } from "./dto/signup-tenant.dto";

@Injectable()
export class TenantSignupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async signup(dto: SignupTenantDto): Promise<IssuedTokens> {
    if (dto.subdomain === DEFAULT_TENANT_SLUG) {
      throw new ConflictException({ code: "SUBDOMAIN_RESERVED", message: "This subdomain is reserved." });
    }
    const plan = await this.prisma.plan.findFirst({ where: { id: dto.planId, isActive: true } });
    if (!plan) {
      throw new NotFoundException({ code: "PLAN_NOT_FOUND", message: "Selected plan does not exist." });
    }

    try {
      const { tenant, roleByName } = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: { name: dto.agencyName, slug: dto.subdomain, status: "TRIAL" },
        });
        const roleByName = await seedTenantRolesAndPermissions(tx, tenant.id);
        await tx.subscription.create({
          data: { tenantId: tenant.id, planId: plan.id, status: "TRIALING" },
        });
        return { tenant, roleByName };
      });

      const superAdminRole = roleByName.get("SuperAdmin");
      if (!superAdminRole) {
        throw new Error("SuperAdmin role was not seeded for the new tenant.");
      }

      const passwordHash = await argon2.hash(dto.ownerPassword);
      const owner = await this.prisma.adminUser.create({
        data: {
          tenantId: tenant.id,
          email: dto.ownerEmail,
          name: dto.ownerName,
          passwordHash,
          roleId: superAdminRole.id,
        },
        include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
      });

      return this.authService.issueTokensFor({
        id: owner.id,
        email: owner.email,
        name: owner.name,
        tenantId: owner.tenantId,
        roleId: owner.roleId,
        roleName: owner.role.name,
        permissions: owner.role.rolePermissions.map((rp) => rp.permission.key),
        isPlatformOwner: false,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = (err.meta?.target as string[] | undefined) ?? [];
        if (target.includes("slug")) {
          throw new ConflictException({ code: "SUBDOMAIN_TAKEN", message: "This subdomain is already in use." });
        }
        throw new ConflictException({ code: "OWNER_EMAIL_TAKEN", message: "An admin account with this email already exists." });
      }
      throw err;
    }
  }
}
