import type { Prisma, PrismaClient } from "@prisma/client";
import { ALL_PERMISSION_KEYS, DEFAULT_ROLE_PERMISSIONS } from "@paxbook/config";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

/**
 * Seeds the standard role/permission matrix for a tenant. Permissions themselves are
 * global (no tenantId) so upserting them is idempotent and cheap to repeat; only the
 * Role/RolePermission rows are tenant-scoped. Shared by prisma/seed.ts (default tenant)
 * and the self-signup flow (new tenants), so a signed-up tenant gets the exact same
 * role matrix as the seeded one, not a hand-rolled subset.
 */
export async function seedTenantRolesAndPermissions(
  prisma: PrismaLike,
  tenantId: string,
): Promise<Map<string, { id: string }>> {
  for (const key of ALL_PERMISSION_KEYS) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }
  const allPermissions = await prisma.permission.findMany();
  const permissionByKey = new Map(allPermissions.map((p) => [p.key, p]));

  const roleByName = new Map<string, { id: string }>();
  for (const [roleName, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId, name: roleName } },
      update: {},
      create: { tenantId, name: roleName, isSystem: true },
    });
    roleByName.set(roleName, role);

    for (const permKey of permissionKeys) {
      const permission = permissionByKey.get(permKey);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  return roleByName;
}
