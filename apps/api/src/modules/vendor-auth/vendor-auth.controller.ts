import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { VendorAuthService } from "./vendor-auth.service";
import { VendorJwtAuthGuard } from "./guards/vendor-jwt-auth.guard";
import { LoginVendorDto } from "./dto/login-vendor.dto";

const REFRESH_COOKIE_NAME = "paxbook_vendor_refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/vendor-auth";

@ApiTags("vendor-auth")
@Public()
@Controller({ path: "vendor-auth", version: "1" })
export class VendorAuthController {
  constructor(
    private readonly vendorAuthService: VendorAuthService,
    private readonly configService: ConfigService,
  ) {}

  @SkipAudit()
  @Post("login")
  async login(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: LoginVendorDto, @Res({ passthrough: true }) res: Response) {
    if (tenant.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This account's organization is currently suspended." });
    }
    const tokens = await this.vendorAuthService.login(tenant.id, dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, vendor: tokens.vendor };
  }

  @SkipAudit()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new UnauthorizedException({ code: "NO_REFRESH_TOKEN", message: "Not authenticated." });
    }
    const tokens = await this.vendorAuthService.refresh(raw);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, vendor: tokens.vendor };
  }

  @SkipAudit()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (raw) {
      await this.vendorAuthService.logout(raw);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return { loggedOut: true };
  }

  @UseGuards(VendorJwtAuthGuard)
  @Get("me")
  me(@CurrentVendor() vendor: RequestVendor) {
    return vendor;
  }

  private setRefreshCookie(res: Response, raw: string, expiresAt: Date) {
    res.cookie(REFRESH_COOKIE_NAME, raw, {
      httpOnly: true,
      secure: this.configService.get<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: REFRESH_COOKIE_PATH,
      expires: expiresAt,
    });
  }
}
