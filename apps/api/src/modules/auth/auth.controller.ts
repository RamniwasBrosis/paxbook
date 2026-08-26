import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AuthService } from "./auth.service";

const REFRESH_COOKIE_NAME = "paxbook_refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @SkipAudit()
  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // req.user was set by LocalStrategy.validate() after AuthGuard('local') ran.
    const validatedAdmin = req.user as Parameters<AuthService["issueTokensFor"]>[0];
    const tokens = await this.authService.issueTokensFor(validatedAdmin);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      admin: tokens.admin,
    };
  }

  @Public()
  @SkipAudit()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new UnauthorizedException({ code: "NO_REFRESH_TOKEN", message: "Not authenticated." });
    }
    const tokens = await this.authService.refresh(raw);
    this.setRefreshCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    return {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      admin: tokens.admin,
    };
  }

  @Public()
  @SkipAudit()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (raw) {
      await this.authService.logout(raw);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return { loggedOut: true };
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentAdmin() admin: RequestAdmin) {
    return admin;
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
