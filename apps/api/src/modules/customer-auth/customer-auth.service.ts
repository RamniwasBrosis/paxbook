import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, type Customer } from "@prisma/client";
import { randomBytes, randomInt } from "node:crypto";
import type { AuthenticatedCustomerDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { SmsService } from "../../common/sms/sms.service";
import { EmailService } from "../../common/email/email.service";
import { sha256Hex } from "../../common/crypto/hash";
import { hashPassword, verifyPassword } from "../../common/crypto/password";
import { decryptSecret } from "../../common/crypto/encryption";
import type { RequestCustomer } from "../../common/types/request-customer";
import type { RegisterCustomerDto } from "./dto/register-customer.dto";

export interface IssuedCustomerTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  customer: AuthenticatedCustomerDto;
  refreshTokenRaw: string;
  refreshTokenExpiresAt: Date;
}

const OTP_TTL_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_RESET_TTL_MINUTES = 60;
const OTP_PLACEHOLDER_EMAIL_SUFFIX = "@otp.paxbook.local";

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  async requestOtp(tenantId: string, phone: string): Promise<{ devOtp?: string; sent: boolean; resendAvailableAt: string }> {
    const recent = await this.prisma.otpCode.findFirst({
      where: { subjectType: "CUSTOMER", subjectId: phone, channel: "SMS", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const cooldownUntil = recent ? new Date(recent.createdAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000) : null;
    if (cooldownUntil && cooldownUntil > new Date()) {
      throw new BadRequestException({
        code: "OTP_COOLDOWN",
        message: "Please wait before requesting another code.",
      });
    }

    const code = String(randomInt(100000, 1000000));
    const codeHash = await hashPassword(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { subjectType: "CUSTOMER", subjectId: phone, channel: "SMS", codeHash, expiresAt },
    });

    const smsResult = await this.smsService.send(tenantId, phone, `Your Paxbook verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);

    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    return {
      devOtp: isProduction ? undefined : code,
      sent: smsResult.sent,
      resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
    };
  }

  async verifyOtp(tenantId: string, phone: string, code: string): Promise<IssuedCustomerTokens> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { subjectType: "CUSTOMER", subjectId: phone, channel: "SMS", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "OTP_EXPIRED", message: "This code has expired. Please request a new one." });
    }
    const matches = await verifyPassword(otp.codeHash, code);
    if (!matches) {
      throw new UnauthorizedException({ code: "OTP_INVALID", message: "Incorrect code." });
    }
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    let customer = await this.prisma.customer.findFirst({ where: { tenantId, phone } });
    if (!customer) {
      // Email is a required column (also used by admin's Customer directory) — OTP-only
      // signups get a recognizable placeholder until the customer sets a real one from their profile.
      customer = await this.prisma.customer.create({
        data: { tenantId, phone, name: "Traveler", email: `${phone.replace(/[^0-9]/g, "")}${OTP_PLACEHOLDER_EMAIL_SUFFIX}`, phoneVerifiedAt: new Date() },
      });
    } else if (!customer.phoneVerifiedAt) {
      customer = await this.prisma.customer.update({ where: { id: customer.id }, data: { phoneVerifiedAt: new Date() } });
    }

    if (customer.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }

    return this.issueTokensFor(customer);
  }

  async register(tenantId: string, dto: RegisterCustomerDto): Promise<IssuedCustomerTokens> {
    const passwordHash = await hashPassword(dto.password);
    let customer: Customer;
    try {
      customer = await this.prisma.customer.create({
        data: { tenantId, name: dto.name, email: dto.email, phone: dto.phone, passwordHash },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException({ code: "CUSTOMER_ALREADY_EXISTS", message: "An account with this email or phone already exists." });
      }
      throw err;
    }
    await this.sendWelcomeEmail(tenantId, customer);
    return this.issueTokensFor(customer);
  }

  private async sendWelcomeEmail(tenantId: string, customer: Customer): Promise<void> {
    if (!customer.email) return;
    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3001");
    const loginUrl = `${frontendUrl}/login`;
    await this.emailService.send(
      tenantId,
      customer.email,
      "Welcome to Paxbook!",
      `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto">
         <h2 style="color:#19377f;margin-bottom:0">Welcome to Paxbook, ${customer.name}!</h2>
         <p>Your account has been created successfully. You're all set to start planning your next trip.</p>
         <p>Log in anytime with the email address you registered (<b>${customer.email}</b>) and your password.</p>
         <p style="margin:28px 0">
           <a href="${loginUrl}" style="background:#f1ba4b;color:#19377f;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">Log in to Paxbook</a>
         </p>
         <p style="color:#64748b;font-size:13px">Need help? Reach us anytime at <a href="mailto:planners@paxbook.in">planners@paxbook.in</a> or +91 73000 47077.</p>
         <p style="color:#94a3b8;font-size:12px;margin-top:24px">Paxbook — Travel | Explore | Experience</p>
       </div>`,
    );
  }

  async login(tenantId: string, email: string, password: string): Promise<IssuedCustomerTokens> {
    const customer = await this.prisma.customer.findFirst({ where: { tenantId, email } });
    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." });
    }
    const matches = await verifyPassword(customer.passwordHash, password);
    if (!matches) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." });
    }
    if (customer.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }
    return this.issueTokensFor(customer);
  }

  /** Always resolves the same way regardless of whether the email is registered, to avoid leaking which emails have accounts. */
  async requestPasswordReset(tenantId: string, email: string): Promise<void> {
    const customer = await this.prisma.customer.findFirst({ where: { tenantId, email } });
    if (!customer) return;

    const raw = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await this.prisma.customerPasswordResetToken.create({
      data: { customerId: customer.id, tokenHash: sha256Hex(raw), expiresAt },
    });

    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3001");
    const resetUrl = `${frontendUrl}/reset-password?token=${raw}`;
    await this.emailService.send(
      tenantId,
      email,
      "Reset your Paxbook password",
      `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto">
         <h2 style="color:#19377f;margin-bottom:0">Reset your password</h2>
         <p>Hi ${customer.name}, we received a request to reset the password on your Paxbook account.</p>
         <p style="margin:28px 0">
           <a href="${resetUrl}" style="background:#f1ba4b;color:#19377f;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">Reset password</a>
         </p>
         <p style="color:#64748b;font-size:13px">This link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes and can only be used once. If you didn't request this, you can safely ignore this email.</p>
         <p style="color:#94a3b8;font-size:12px;margin-top:24px">Paxbook — Travel | Explore | Experience</p>
       </div>`,
    );
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = sha256Hex(rawToken);
    const resetToken = await this.prisma.customerPasswordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "RESET_TOKEN_INVALID", message: "This password reset link is invalid or has expired." });
    }

    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction([
      this.prisma.customer.update({ where: { id: resetToken.customerId }, data: { passwordHash } }),
      this.prisma.customerPasswordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);
  }

  async refresh(rawRefreshToken: string): Promise<IssuedCustomerTokens> {
    const tokenHash = sha256Hex(rawRefreshToken);
    const existing = await this.prisma.customerRefreshToken.findUnique({
      where: { tokenHash },
      include: { customer: { include: { tenant: { select: { status: true } } } } },
    });

    if (!existing) {
      throw new UnauthorizedException({ code: "INVALID_REFRESH_TOKEN", message: "Session expired. Please log in again." });
    }
    if (existing.revokedAt) {
      await this.prisma.customerRefreshToken.updateMany({
        where: { customerId: existing.customerId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_REUSED", message: "Session expired. Please log in again." });
    }
    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "REFRESH_TOKEN_EXPIRED", message: "Session expired. Please log in again." });
    }
    if (existing.customer.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }
    if (existing.customer.tenant.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "TENANT_SUSPENDED", message: "This store is currently unavailable." });
    }

    const tokens = await this.issueTokensFor(existing.customer);
    await this.prisma.customerRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedBy: sha256Hex(tokens.refreshTokenRaw) },
    });
    return tokens;
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = sha256Hex(rawRefreshToken);
    await this.prisma.customerRefreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  /** Builds Google's consent-screen URL for this tenant. `state` carries the tenantId through the redirect round-trip. */
  async buildGoogleAuthorizeUrl(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { googleClientId: true, googleClientSecretEncrypted: true } });
    if (!tenant?.googleClientId || !tenant.googleClientSecretEncrypted) {
      throw new BadRequestException({ code: "GOOGLE_LOGIN_NOT_CONFIGURED", message: "Google login isn't set up for this site yet." });
    }
    const redirectUri = `${this.configService.get<string>("API_PUBLIC_BASE_URL", "http://localhost:4000/api/v1")}/customer-auth/google/callback`;
    const params = new URLSearchParams({
      client_id: tenant.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: tenantId,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /** Exchanges the OAuth code for a Google profile, then finds-or-creates the matching customer. */
  async loginWithGoogle(tenantId: string, code: string): Promise<IssuedCustomerTokens> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { googleClientId: true, googleClientSecretEncrypted: true } });
    const encryptionKey = this.configService.get<string>("INTEGRATION_ENCRYPTION_KEY");
    if (!tenant?.googleClientId || !tenant.googleClientSecretEncrypted || !encryptionKey) {
      throw new BadRequestException({ code: "GOOGLE_LOGIN_NOT_CONFIGURED", message: "Google login isn't set up for this site yet." });
    }

    const redirectUri = `${this.configService.get<string>("API_PUBLIC_BASE_URL", "http://localhost:4000/api/v1")}/customer-auth/google/callback`;
    const clientSecret = decryptSecret(tenant.googleClientSecretEncrypted, encryptionKey);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: tenant.googleClientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException({ code: "GOOGLE_TOKEN_EXCHANGE_FAILED", message: "Could not verify your Google account." });
    }
    const tokenJson = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!profileRes.ok) {
      throw new UnauthorizedException({ code: "GOOGLE_PROFILE_FETCH_FAILED", message: "Could not read your Google profile." });
    }
    const profile = (await profileRes.json()) as { email: string; name?: string; email_verified?: boolean };

    let customer = await this.prisma.customer.findFirst({ where: { tenantId, email: profile.email } });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { tenantId, name: profile.name ?? profile.email.split("@")[0]!, email: profile.email },
      });
    }
    if (customer.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }

    return this.issueTokensFor(customer);
  }

  private async issueTokensFor(customer: Customer): Promise<IssuedCustomerTokens> {
    const payload: RequestCustomer = {
      sub: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tenantId: customer.tenantId,
    };
    const expiresIn = this.configService.get<string>("CUSTOMER_JWT_ACCESS_TTL", "15m");
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(accessToken) as { exp: number };

    const raw = randomBytes(32).toString("hex");
    const ttlDays = this.configService.get<number>("CUSTOMER_JWT_REFRESH_TTL_DAYS", 30);
    const refreshTokenExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await this.prisma.customerRefreshToken.create({
      data: { customerId: customer.id, tokenHash: sha256Hex(raw), expiresAt: refreshTokenExpiresAt },
    });

    return {
      accessToken,
      accessTokenExpiresAt: new Date(decoded.exp * 1000).toISOString(),
      customer: toAuthenticatedCustomerDto(customer),
      refreshTokenRaw: raw,
      refreshTokenExpiresAt,
    };
  }
}

function toAuthenticatedCustomerDto(customer: Customer): AuthenticatedCustomerDto {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email.endsWith(OTP_PLACEHOLDER_EMAIL_SUFFIX) ? null : customer.email,
    phone: customer.phone,
    tenantId: customer.tenantId,
  };
}
