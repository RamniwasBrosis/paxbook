import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Vendor } from "@prisma/client";
import { randomBytes } from "node:crypto";
import type { AuthenticatedVendorDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { sha256Hex } from "../../common/crypto/hash";
import { verifyPassword } from "../../common/crypto/password";
import type { RequestVendor } from "../../common/types/request-vendor";

export interface IssuedVendorTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  vendor: AuthenticatedVendorDto;
  refreshTokenRaw: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class VendorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(tenantId: string, email: string, password: string): Promise<IssuedVendorTokens> {
    const vendor = await this.prisma.vendor.findFirst({ where: { tenantId, email } });
    if (!vendor || !vendor.passwordHash) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." });
    }
    const matches = await verifyPassword(vendor.passwordHash, password);
    if (!matches) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." });
    }
    if (vendor.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This vendor account is inactive." });
    }
    return this.issueTokensFor(vendor);
  }

  async refresh(rawRefreshToken: string): Promise<IssuedVendorTokens> {
    const tokenHash = sha256Hex(rawRefreshToken);
    const existing = await this.prisma.vendorRefreshToken.findUnique({
      where: { tokenHash },
      include: { vendor: { include: { tenant: { select: { status: true } } } } },
    });

    if (!existing) {
      throw new UnauthorizedException({ code: "INVALID_REFRESH_TOKEN", message: "Session expired. Please log in again." });
    }
    if (existing.revokedAt) {
      await this.prisma.vendorRefreshToken.updateMany({
        where: { vendorId: existing.vendorId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_REUSED", message: "Session expired. Please log in again." });
    }
    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_EXPIRED", message: "Session expired. Please log in again." });
    }
    if (existing.vendor.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This vendor account is inactive." });
    }
    if (existing.vendor.tenant.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This account's organization is currently suspended." });
    }

    const tokens = await this.issueTokensFor(existing.vendor);
    await this.prisma.vendorRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedBy: sha256Hex(tokens.refreshTokenRaw) },
    });
    return tokens;
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = sha256Hex(rawRefreshToken);
    await this.prisma.vendorRefreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private async issueTokensFor(vendor: Vendor): Promise<IssuedVendorTokens> {
    const payload: RequestVendor = {
      sub: vendor.id,
      name: vendor.name,
      email: vendor.email ?? "",
      tenantId: vendor.tenantId,
    };
    const expiresIn = this.configService.get<string>("VENDOR_JWT_ACCESS_TTL", "15m");
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(accessToken) as { exp: number };

    const raw = randomBytes(32).toString("hex");
    const ttlDays = this.configService.get<number>("VENDOR_JWT_REFRESH_TTL_DAYS", 30);
    const refreshTokenExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await this.prisma.vendorRefreshToken.create({
      data: { vendorId: vendor.id, tokenHash: sha256Hex(raw), expiresAt: refreshTokenExpiresAt },
    });

    return {
      accessToken,
      accessTokenExpiresAt: new Date(decoded.exp * 1000).toISOString(),
      vendor: { id: vendor.id, name: vendor.name, email: vendor.email, categoryType: vendor.categoryType, tenantId: vendor.tenantId },
      refreshTokenRaw: raw,
      refreshTokenExpiresAt,
    };
  }
}
