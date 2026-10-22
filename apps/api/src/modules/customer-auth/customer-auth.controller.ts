import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CaptchaService } from "../../common/captcha/captcha.service";
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
import { VerifyOtpDto, VerifyOtpIdentifierDto } from "./dto/verify-otp.dto";
import { RegisterCustomerDto, ResendSignupOtpDto, VerifySignupDto } from "./dto/register-customer.dto";
import { LoginCustomerDto } from "./dto/login-customer.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

const REFRESH_COOKIE_NAME = "paxbook_customer_refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/customer-auth";

@ApiTags("customer-auth")
@Public()
@Controller({ path: "customer-auth", version: "1" })
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
  ) {}

  /** A fresh image code for the login, signup and OTP forms. */
  @SkipAudit()
  @Get("captcha")
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  captcha() {
    return this.captchaService.create();
  }

  @SkipAudit()
  @Post("otp/request")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async requestOtp(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: RequestOtpDto) {
    this.assertTenantActive(tenant);
    await this.captchaService.assertValid(dto.captchaId, dto.captchaAnswer);
    return this.customerAuthService.requestOtp(tenant.id, dto.identifier);
  }

  /** Same as otp/request but without a new captcha: the "Resend code" link on the code screen. */
  @SkipAudit()
  @Post("otp/resend")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resendOtp(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: VerifyOtpIdentifierDto) {
    this.assertTenantActive(tenant);
    return this.customerAuthService.requestOtp(tenant.id, dto.identifier);
  }

  @SkipAudit()
  @Post("otp/verify")
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async verifyOtp(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    this.assertTenantActive(tenant);
    const tokens = await this.customerAuthService.verifyOtp(tenant.id, dto.identifier, dto.code);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  /** Signup step 1: details + password → codes go to the email (and mobile when SMS is set up). */
  @SkipAudit()
  @Post("register/start")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async registerStart(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: RegisterCustomerDto) {
    this.assertTenantActive(tenant);
    await this.captchaService.assertValid(dto.captchaId, dto.captchaAnswer);
    return this.customerAuthService.startSignup(tenant.id, dto);
  }

  @SkipAudit()
  @Post("register/resend")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  registerResend(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: ResendSignupOtpDto) {
    this.assertTenantActive(tenant);
    return this.customerAuthService.resendSignupOtp(tenant.id, dto.signupId, dto.channel);
  }

  /** Signup step 2: verify the codes; the account is created and the customer logs in next. */
  @SkipAudit()
  @Post("register/verify")
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  registerVerify(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: VerifySignupDto) {
    this.assertTenantActive(tenant);
    return this.customerAuthService.completeSignup(tenant.id, dto.signupId, dto.emailCode, dto.phoneCode);
  }

  @SkipAudit()
  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  async login(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: LoginCustomerDto, @Res({ passthrough: true }) res: Response) {
    this.assertTenantActive(tenant);
    await this.captchaService.assertValid(dto.captchaId, dto.captchaAnswer);
    const tokens = await this.customerAuthService.login(tenant.id, dto.identifier, dto.password);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return { accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.accessTokenExpiresAt, customer: tokens.customer };
  }

  @SkipAudit()
  @Post("password/forgot")
  async forgotPassword(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: RequestPasswordResetDto) {
    await this.customerAuthService.requestPasswordReset(tenant.id, dto.email);
    return { sent: true };
  }

  @SkipAudit()
  @Post("password/reset")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.customerAuthService.resetPassword(dto.token, dto.newPassword);
    return { reset: true };
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
