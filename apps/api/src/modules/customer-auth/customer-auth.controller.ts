import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerJwtAuthGuard } from "./guards/customer-jwt-auth.guard";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { LoginCustomerDto } from "./dto/login-customer.dto";

const REFRESH_COOKIE_NAME = "paxbook_customer_refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/customer-auth";

@ApiTags("customer-auth")
@Public()
@Controller({ path: "customer-auth", version: "1" })
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly configService: ConfigService,
  ) {}

  @SkipAudit()
  @Post("otp/request")
  requestOtp(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: RequestOtpDto) {
    return this.customerAuthService.requestOtp(tenant.id, dto.phone);
  }

  @SkipAudit()
  @Post("otp/verify")
  async verifyOtp(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    this.assertTenantActive(tenant);
    const tokens = await this.customerAuthService.verifyOtp(tenant.id, dto.phone, dto.code);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  @SkipAudit()
  @Post("register")
  async register(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: RegisterCustomerDto, @Res({ passthrough: true }) res: Response) {
    this.assertTenantActive(tenant);
    const tokens = await this.customerAuthService.register(tenant.id, dto);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  @SkipAudit()
  @Post("login")
  async login(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: LoginCustomerDto, @Res({ passthrough: true }) res: Response) {
    this.assertTenantActive(tenant);
    const tokens = await this.customerAuthService.login(tenant.id, dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  @SkipAudit()
  @Get("google/start")
  async googleStart(@CurrentTenant() tenant: ResolvedTenant) {
    const authorizeUrl = await this.customerAuthService.buildGoogleAuthorizeUrl(tenant.id);
    return { authorizeUrl };
  }

  @SkipAudit()
  @Get("google/callback")
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const code = req.query.code as string | undefined;
    const tenantId = req.query.state as string | undefined;
    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3001");
    if (!code || !tenantId) {
      return res.redirect(`${frontendUrl}/login?error=google_login_failed`);
    }

    try {
      const tokens = await this.customerAuthService.loginWithGoogle(tenantId, code);
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshToken: tokens.refreshTokenRaw,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
        customer: Buffer.from(JSON.stringify(tokens.customer)).toString("base64url"),
      });
      return res.redirect(`${frontendUrl}/api/auth/google/callback?${params.toString()}`);
    } catch {
      return res.redirect(`${frontendUrl}/login?error=google_login_failed`);
    }
  }

  @SkipAudit()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new UnauthorizedException({ code: "NO_REFRESH_TOKEN", message: "Not authenticated." });
    }
    const tokens = await this.customerAuthService.refresh(raw);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  @SkipAudit()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (raw) {
      await this.customerAuthService.logout(raw);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return { loggedOut: true };
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Get("me")
  me(@CurrentCustomer() customer: RequestCustomer) {
    return customer;
  }

  private assertTenantActive(tenant: ResolvedTenant): void {
    if (tenant.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This store is currently unavailable." });
    }
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
