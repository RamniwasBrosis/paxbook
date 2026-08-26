import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { RoleDto } from "@paxbook/types";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<RoleDto[]> {
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    }));
  }

  async assertRoleBelongsToTenant(roleId: string, tenantId: string): Promise<void> {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND", message: "Selected role does not exist." });
    }
  }
}
