import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "node:crypto";
import type { PermissionKey } from "@paxbook/config";
import type { AuthenticatedAdminDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { sha256Hex } from "../../common/crypto/hash";
import { verifyPassword } from "../../common/crypto/password";
import { UsersService } from "../users/users.service";
import type { RequestAdmin } from "../../common/types/request-admin";

export interface ValidatedAdmin {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  isPlatformOwner: boolean;
}

export interface IssuedTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  admin: AuthenticatedAdminDto;
  refreshTokenRaw: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<ValidatedAdmin | null> {
    const admin = await this.usersService.findByEmailForAuth(email);
    if (!admin || admin.status !== "ACTIVE") return null;

    if (admin.tenantStatus === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This account's organization is currently suspended." });
    }

    const passwordMatches = await verifyPassword(admin.passwordHash, password);
    if (!passwordMatches) return null;

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      tenantId: admin.tenantId,
      roleId: admin.roleId,
      roleName: admin.roleName,
      permissions: admin.permissions,
      isPlatformOwner: admin.isPlatformOwner,
    };
  }

  async issueTokensFor(admin: ValidatedAdmin): Promise<IssuedTokens> {
    const { token, expiresAt } = this.signAccessToken(admin);
    const { raw, expiresAt: refreshExpiresAt } = await this.createRefreshToken(admin.id);

    return {
      accessToken: token,
      accessTokenExpiresAt: expiresAt,
      admin: toAuthenticatedAdminDto(admin),
      refreshTokenRaw: raw,
      refreshTokenExpiresAt: refreshExpiresAt,
    };
  }

  async refresh(rawRefreshToken: string): Promise<IssuedTokens> {
    const tokenHash = sha256Hex(rawRefreshToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        adminUser: {
          include: {
            role: { include: { rolePermissions: { include: { permission: true } } } },
            tenant: { select: { status: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new UnauthorizedException({ code: "INVALID_REFRESH_TOKEN", message: "Session expired. Please log in again." });
    }

    if (existing.revokedAt) {
      // Reuse of an already-rotated/revoked token is a signal of theft — kill the whole chain for this admin.
      await this.prisma.refreshToken.updateMany({
        where: { adminUserId: existing.adminUserId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_REUSED", message: "Session expired. Please log in again." });
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_EXPIRED", message: "Session expired. Please log in again." });
    }

    if (existing.adminUser.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }
    if (existing.adminUser.tenant.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This account's organization is currently suspended." });
    }

    const admin: ValidatedAdmin = {
      id: existing.adminUser.id,
      email: existing.adminUser.email,
      name: existing.adminUser.name,
      tenantId: existing.adminUser.tenantId,
      roleId: existing.adminUser.roleId,
      roleName: existing.adminUser.role.name,
      permissions: existing.adminUser.role.rolePermissions.map((rp) => rp.permission.key),
      isPlatformOwner: existing.adminUser.isPlatformOwner,
    };

    const { token, expiresAt } = this.signAccessToken(admin);
    const { raw: newRaw, expiresAt: newRefreshExpiresAt } = await this.createRefreshToken(admin.id);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedBy: sha256Hex(newRaw) },
    });

    return {
      accessToken: token,
      accessTokenExpiresAt: expiresAt,
      admin: toAuthenticatedAdminDto(admin),
      refreshTokenRaw: newRaw,
      refreshTokenExpiresAt: newRefreshExpiresAt,
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = sha256Hex(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private signAccessToken(admin: ValidatedAdmin): { token: string; expiresAt: string } {
    const payload: RequestAdmin = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      roleId: admin.roleId,
      roleName: admin.roleName,
      tenantId: admin.tenantId,
      permissions: admin.permissions as PermissionKey[],
      isPlatformOwner: admin.isPlatformOwner,
    };
    const expiresIn = this.configService.get<string>("JWT_ACCESS_TTL", "15m");
    const token = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(token) as { exp: number };
    return { token, expiresAt: new Date(decoded.exp * 1000).toISOString() };
  }

  private async createRefreshToken(adminUserId: string): Promise<{ raw: string; expiresAt: Date }> {
    const raw = randomBytes(32).toString("hex");
    const ttlDays = this.configService.get<number>("JWT_REFRESH_TTL_DAYS", 30);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { adminUserId, tokenHash: sha256Hex(raw), expiresAt },
    });

    return { raw, expiresAt };
  }
}

function toAuthenticatedAdminDto(admin: ValidatedAdmin): AuthenticatedAdminDto {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    roleId: admin.roleId,
    roleName: admin.roleName,
    permissions: admin.permissions as PermissionKey[],
    tenantId: admin.tenantId,
    isPlatformOwner: admin.isPlatformOwner,
  };
}
