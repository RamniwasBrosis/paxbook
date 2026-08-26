import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { hashPassword } from "../../common/crypto/password";
import { RolesService } from "../roles/roles.service";
import type { AdminUserDto } from "@paxbook/types";
import type { CreateAdminUserDto } from "./dto/create-admin-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async findAll(tenantId: string): Promise<AdminUserDto[]> {
    const users = await this.prisma.adminUser.findMany({
      where: { tenantId },
      include: { role: true },
      orderBy: { createdAt: "asc" },
    });
    return users.map(toAdminUserDto);
  }

  async create(tenantId: string, dto: CreateAdminUserDto): Promise<AdminUserDto> {
    await this.rolesService.assertRoleBelongsToTenant(dto.roleId, tenantId);

    const existing = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({
        code: "ADMIN_EMAIL_TAKEN",
        message: "An admin account with this email already exists.",
      });
    }

    const passwordHash = await hashPassword(dto.password);
    const created = await this.prisma.adminUser.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        roleId: dto.roleId,
        passwordHash,
      },
      include: { role: true },
    });

    return toAdminUserDto(created);
  }

  /** Used only by AuthService — includes passwordHash and flattened permission keys. */
  async findByEmailForAuth(email: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: { include: { rolePermissions: { include: { permission: true } } } },
        tenant: { select: { status: true } },
      },
    });
    if (!admin) return null;

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      passwordHash: admin.passwordHash,
      status: admin.status,
      tenantId: admin.tenantId,
      tenantStatus: admin.tenant.status,
      roleId: admin.roleId,
      roleName: admin.role.name,
      isPlatformOwner: admin.isPlatformOwner,
      permissions: admin.role.rolePermissions.map((rp) => rp.permission.key),
    };
  }
}

function toAdminUserDto(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: string;
  roleId: string;
  role: { name: string };
  createdAt: Date;
}): AdminUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    status: user.status as "ACTIVE" | "SUSPENDED",
    roleId: user.roleId,
    roleName: user.role.name,
    createdAt: user.createdAt.toISOString(),
  };
}
