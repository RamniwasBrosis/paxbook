import { Body, Controller, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { TenantSignupService } from "./tenant-signup.service";
import { SignupTenantDto } from "./dto/signup-tenant.dto";

const REFRESH_COOKIE_NAME = "paxbook_refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

/** New agency self-signup — creates a Tenant, seeds its role matrix, creates the owner AdminUser, and logs them straight in. */
@ApiTags("platform")
@Public()
@SkipAudit()
@Controller({ path: "platform/tenants", version: "1" })
export class TenantSignupController {
  constructor(
    private readonly tenantSignupService: TenantSignupService,
    private readonly configService: ConfigService,
  ) {}

  @Post("signup")
  async signup(@Body() dto: SignupTenantDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.tenantSignupService.signup(dto);
    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshTokenRaw, {
      httpOnly: true,
      secure: this.configService.get<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: REFRESH_COOKIE_PATH,
      expires: tokens.refreshTokenExpiresAt,
    });
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, admin: tokens.admin };
  }
}
