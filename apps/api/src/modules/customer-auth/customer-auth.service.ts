import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, type Customer } from "@prisma/client";
import { randomBytes, randomInt } from "node:crypto";
import type { AuthenticatedCustomerDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { SmsService } from "../../common/sms/sms.service";
import { EmailService } from "../../common/email/email.service";
import { renderEmail } from "../../common/email/email-layout";
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

type OtpChannel = "EMAIL" | "SMS";

export interface SignupStartResult {
  signupId: string;
  email: string;
  phone: string | null;
  /** False until an SMS provider is configured; the mobile is then saved unverified. */
  phoneOtpRequired: boolean;
  resendAvailableAt: string;
  devEmailOtp?: string;
  devPhoneOtp?: string;
}

const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const SIGNUP_TTL_MINUTES = 30;
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

  // ---------------------------------------------------------------------------
  // One-time codes
  // ---------------------------------------------------------------------------

  /** A fresh 6-digit code for `subjectId`, unless one was sent less than a minute ago. */
  private async issueOtp(subjectType: string, subjectId: string, channel: OtpChannel): Promise<{ code: string; resendAvailableAt: string }> {
    const recent = await this.prisma.otpCode.findFirst({
      where: { subjectType, subjectId, channel, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const cooldownUntil = recent ? new Date(recent.createdAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000) : null;
    if (cooldownUntil && cooldownUntil > new Date()) {
      const wait = Math.ceil((cooldownUntil.getTime() - Date.now()) / 1000);
      throw new BadRequestException({ code: "OTP_COOLDOWN", message: `Please wait ${wait} seconds before requesting another code.` });
    }
    const code = String(randomInt(100000, 1000000));
    await this.prisma.otpCode.create({
      data: { subjectType, subjectId, channel, codeHash: await hashPassword(code), expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000) },
    });
    return { code, resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000).toISOString() };
  }

  /**
   * Checks the latest code; a wrong guess counts towards a small limit, after which the code is burnt
   * and a new one must be requested. Returns the code's id so the caller decides when to consume it
   * (signup checks the email and mobile codes before consuming either).
   */
  private async checkOtp(subjectType: string, subjectId: string, channel: OtpChannel, code: string): Promise<string> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { subjectType, subjectId, channel, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const label = channel === "EMAIL" ? "email" : "mobile";
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "OTP_EXPIRED", message: `The ${label} code has expired. Please request a new one.` });
    }
    if (!(await verifyPassword(otp.codeHash, code))) {
      const attempts = otp.attempts + 1;
      const burnt = attempts >= OTP_MAX_ATTEMPTS;
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts, ...(burnt ? { consumedAt: new Date() } : {}) } });
      throw new UnauthorizedException({
        code: burnt ? "OTP_LOCKED" : "OTP_INVALID",
        message: burnt
          ? `Too many wrong tries. Please request a new ${label} code.`
          : `Incorrect ${label} code. ${OTP_MAX_ATTEMPTS - attempts} ${OTP_MAX_ATTEMPTS - attempts === 1 ? "try" : "tries"} left.`,
      });
    }
    return otp.id;
  }

  private async sendEmailCode(tenantId: string, email: string, name: string, code: string, purpose: "signup" | "login"): Promise<void> {
    await this.emailService.send(
      tenantId,
      email,
      purpose === "signup" ? `${code} is your Paxbook verification code` : `${code} is your Paxbook login code`,
      renderEmail({
        preheader: `Your code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
        eyebrow: purpose === "signup" ? "Verify your email" : "Log in",
        title: purpose === "signup" ? "Confirm your email address" : "Your one-time login code",
        recipientName: name,
        paragraphs: [
          purpose === "signup" ? "Enter this code on Paxbook to finish creating your account." : "Enter this code on Paxbook to log in.",
          `It expires in ${OTP_TTL_MINUTES} minutes. Never share it with anyone, including Paxbook staff.`,
        ],
        details: [["Your code", code]],
        note: "Didn't ask for this? You can ignore this email; nothing changes without the code.",
      }),
    );
  }

  private async sendSmsCode(tenantId: string, phone: string, code: string): Promise<boolean> {
    const result = await this.smsService.send(tenantId, phone, `${code} is your Paxbook verification code. It expires in ${OTP_TTL_MINUTES} minutes. Do not share it.`);
    return result.sent;
  }

  private devCode(code: string): string | undefined {
    return this.configService.get<string>("NODE_ENV") === "production" ? undefined : code;
  }

  // ---------------------------------------------------------------------------
  // Finding a customer by email or mobile
  // ---------------------------------------------------------------------------

  private async findByIdentifier(tenantId: string, identifier: string): Promise<Customer | null> {
    const id = identifier.trim();
    if (id.includes("@")) {
      return this.prisma.customer.findFirst({ where: { tenantId, email: { equals: id, mode: "insensitive" } } });
    }
    const variants = phoneVariants(id);
    if (variants.length === 0) return null;
    return this.prisma.customer.findFirst({ where: { tenantId, phone: { in: variants } } });
  }

  // ---------------------------------------------------------------------------
  // OTP login (email or mobile)
  // ---------------------------------------------------------------------------

  async requestOtp(tenantId: string, identifier: string): Promise<{ channel: OtpChannel; sentTo: string; resendAvailableAt: string; devOtp?: string }> {
    const customer = await this.findByIdentifier(tenantId, identifier);
    const isEmail = identifier.includes("@");
    if (!customer) {
      throw new BadRequestException({
        code: "CUSTOMER_NOT_FOUND",
        message: `No account found with this ${isEmail ? "email" : "mobile number"}. Please sign up first.`,
      });
    }
    if (isEmail) {
      const { code, resendAvailableAt } = await this.issueOtp("CUSTOMER", `${tenantId}:${customer.id}`, "EMAIL");
      await this.sendEmailCode(tenantId, customer.email, customer.name, code, "login");
      return { channel: "EMAIL", sentTo: maskEmail(customer.email), resendAvailableAt, devOtp: this.devCode(code) };
    }
    if (!(await this.smsService.isConfigured(tenantId))) {
      throw new BadRequestException({
        code: "SMS_NOT_AVAILABLE",
        message: "Login with a mobile OTP isn't available yet. Please use your email for the code, or log in with your password.",
      });
    }
    const { code, resendAvailableAt } = await this.issueOtp("CUSTOMER", `${tenantId}:${customer.id}`, "SMS");
    await this.sendSmsCode(tenantId, customer.phone!, code);
    return { channel: "SMS", sentTo: maskPhone(customer.phone!), resendAvailableAt, devOtp: this.devCode(code) };
  }

  async verifyOtp(tenantId: string, identifier: string, code: string): Promise<IssuedCustomerTokens> {
    const customer = await this.findByIdentifier(tenantId, identifier);
    if (!customer) throw new UnauthorizedException({ code: "OTP_EXPIRED", message: "This code has expired. Please request a new one." });
    const channel: OtpChannel = identifier.includes("@") ? "EMAIL" : "SMS";
    const otpId = await this.checkOtp("CUSTOMER", `${tenantId}:${customer.id}`, channel, code);
    await this.prisma.otpCode.update({ where: { id: otpId }, data: { consumedAt: new Date() } });
    if (customer.status !== "ACTIVE") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }
    // Receiving the code proves the address works.
    const verified = channel === "EMAIL" ? (customer.emailVerifiedAt ? null : { emailVerifiedAt: new Date() }) : customer.phoneVerifiedAt ? null : { phoneVerifiedAt: new Date() };
    const fresh = verified ? await this.prisma.customer.update({ where: { id: customer.id }, data: verified }) : customer;
    return this.issueTokensFor(fresh);
  }

  // ---------------------------------------------------------------------------
  // Signup: details → email (and mobile) code → account → log in
  // ---------------------------------------------------------------------------

  async startSignup(tenantId: string, dto: RegisterCustomerDto): Promise<SignupStartResult> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({ code: "PASSWORD_MISMATCH", message: "Password and confirm password don't match." });
    }
    const email = dto.email.trim().toLowerCase();
    const phone = normalizePhone(dto.phone);
    const byEmail = await this.prisma.customer.findFirst({ where: { tenantId, email: { equals: email, mode: "insensitive" } } });
    if (byEmail?.passwordHash) {
      throw new ConflictException({ code: "CUSTOMER_ALREADY_EXISTS", message: "An account with this email already exists. Please log in." });
    }
    const byPhone = phone ? await this.prisma.customer.findFirst({ where: { tenantId, phone: { in: phoneVariants(phone) } } }) : null;
    if (byPhone && byPhone.id !== byEmail?.id && byPhone.passwordHash) {
      throw new ConflictException({ code: "PHONE_ALREADY_EXISTS", message: "This mobile number is already registered. Please log in." });
    }

    await this.prisma.pendingCustomerSignup.deleteMany({ where: { tenantId, email } });
    const smsReady = Boolean(phone) && (await this.smsService.isConfigured(tenantId));
    const pending = await this.prisma.pendingCustomerSignup.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        email,
        phone,
        passwordHash: await hashPassword(dto.password),
        phoneOtpSent: smsReady,
        expiresAt: new Date(Date.now() + SIGNUP_TTL_MINUTES * 60 * 1000),
      },
    });

    const emailOtp = await this.issueOtp("SIGNUP", pending.id, "EMAIL");
    await this.sendEmailCode(tenantId, email, pending.name, emailOtp.code, "signup");
    let phoneDev: string | undefined;
    if (smsReady && phone) {
      const phoneOtp = await this.issueOtp("SIGNUP", pending.id, "SMS");
      await this.sendSmsCode(tenantId, phone, phoneOtp.code);
      phoneDev = this.devCode(phoneOtp.code);
    }
    return {
      signupId: pending.id,
      email: maskEmail(email),
      phone: phone ? maskPhone(phone) : null,
      phoneOtpRequired: smsReady,
      resendAvailableAt: emailOtp.resendAvailableAt,
      devEmailOtp: this.devCode(emailOtp.code),
      devPhoneOtp: phoneDev,
    };
  }

  async resendSignupOtp(tenantId: string, signupId: string, channel: OtpChannel): Promise<{ resendAvailableAt: string; devOtp?: string }> {
    const pending = await this.activePendingSignup(tenantId, signupId);
    if (channel === "SMS" && (!pending.phoneOtpSent || !pending.phone)) {
      throw new BadRequestException({ code: "SMS_NOT_AVAILABLE", message: "Mobile verification isn't available yet." });
    }
    const { code, resendAvailableAt } = await this.issueOtp("SIGNUP", pending.id, channel);
    if (channel === "EMAIL") await this.sendEmailCode(tenantId, pending.email, pending.name, code, "signup");
    else await this.sendSmsCode(tenantId, pending.phone!, code);
    return { resendAvailableAt, devOtp: this.devCode(code) };
  }

  /** Verifies the codes and creates the account (or claims a password-less guest one). No session: the customer logs in next. */
  async completeSignup(tenantId: string, signupId: string, emailCode: string, phoneCode?: string): Promise<{ email: string }> {
    const pending = await this.activePendingSignup(tenantId, signupId);
    const emailOtpId = await this.checkOtp("SIGNUP", pending.id, "EMAIL", emailCode);
    let phoneOtpId: string | null = null;
    if (pending.phoneOtpSent) {
      if (!phoneCode) throw new BadRequestException({ code: "PHONE_CODE_REQUIRED", message: "Enter the code sent to your mobile." });
      phoneOtpId = await this.checkOtp("SIGNUP", pending.id, "SMS", phoneCode);
    }
    await this.prisma.otpCode.updateMany({ where: { id: { in: [emailOtpId, ...(phoneOtpId ? [phoneOtpId] : [])] } }, data: { consumedAt: new Date() } });

    const now = new Date();
    const existing = await this.prisma.customer.findFirst({ where: { tenantId, email: { equals: pending.email, mode: "insensitive" } } });
    if (existing?.passwordHash) {
      throw new ConflictException({ code: "CUSTOMER_ALREADY_EXISTS", message: "An account with this email already exists. Please log in." });
    }
    const base = {
      name: pending.name,
      passwordHash: pending.passwordHash,
      emailVerifiedAt: now,
      termsAcceptedAt: now,
      ...(phoneOtpId ? { phoneVerifiedAt: now } : {}),
    };
    const save = (phone: string | null) =>
      existing
        ? this.prisma.customer.update({ where: { id: existing.id }, data: { ...base, ...(phone && !existing.phone ? { phone } : {}) } })
        : this.prisma.customer.create({ data: { tenantId, email: pending.email, phone, ...base } });
    let customer: Customer;
    try {
      customer = await save(pending.phone);
    } catch (err) {
      // The mobile belongs to another (password-less) record: keep the account, leave the mobile off.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
      customer = await save(null);
    }
    await this.prisma.pendingCustomerSignup.delete({ where: { id: pending.id } });
    await this.sendWelcomeEmail(tenantId, customer);
    return { email: customer.email };
  }

  private async activePendingSignup(tenantId: string, signupId: string) {
    const pending = await this.prisma.pendingCustomerSignup.findFirst({ where: { id: signupId, tenantId } });
    if (!pending || pending.expiresAt < new Date()) {
      throw new BadRequestException({ code: "SIGNUP_EXPIRED", message: "This signup has expired. Please fill in your details again." });
    }
    return pending;
  }

  private async sendWelcomeEmail(tenantId: string, customer: Customer): Promise<void> {
    if (!customer.email) return;
    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3001");
    const loginUrl = `${frontendUrl}/login`;
    await this.emailService.send(
      tenantId,
      customer.email,
      "Welcome to Paxbook — your account is ready",
      renderEmail({
        preheader: "Your Paxbook account is ready. Save trips, unlock prices and track bookings.",
        eyebrow: "Welcome aboard",
        title: "Your Paxbook account is ready",
        recipientName: customer.name,
        paragraphs: [
          "Thanks for signing up. You can now unlock package prices, save itineraries to your wishlist, and track every booking, voucher and e-ticket in one place.",
          "Log in any time with the email address below and the password you chose.",
        ],
        details: [["Login email", customer.email]],
        cta: { label: "Log in to Paxbook", url: loginUrl },
        note: "Didn't create this account? Reply to this email and we'll look into it.",
      }),
    );
  }

  async login(tenantId: string, identifier: string, password: string): Promise<IssuedCustomerTokens> {
    const customer = await this.findByIdentifier(tenantId, identifier);
    const wrong = new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Incorrect email/mobile or password." });
    if (!customer || !customer.passwordHash) throw wrong;
    if (!(await verifyPassword(customer.passwordHash, password))) throw wrong;
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
      renderEmail({
        preheader: `Use this link within ${PASSWORD_RESET_TTL_MINUTES} minutes to set a new password.`,
        eyebrow: "Account security",
        title: "Reset your password",
        recipientName: customer.name,
        paragraphs: ["We received a request to reset the password on your Paxbook account. Tap the button below to choose a new one."],
        cta: { label: "Reset password", url: resetUrl },
        note: `This link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes and can be used once. If you didn't ask for this, you can ignore this email — your password won't change.`,
      }),
    );
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = sha256Hex(rawToken);
    const resetToken = await this.prisma.customerPasswordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "RESET_TOKEN_INVALID", message: "This password reset link is invalid or has expired." });
    }

    const passwordHash = await hashPassword(newPassword);
    const [customer] = await this.prisma.$transaction([
      this.prisma.customer.update({ where: { id: resetToken.customerId }, data: { passwordHash } }),
      this.prisma.customerPasswordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    // Standard security notice: tells the owner if someone else changed their password.
    if (customer.email) {
      const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3001");
      await this.emailService
        .send(
          customer.tenantId,
          customer.email,
          "Your Paxbook password was changed",
          renderEmail({
            preheader: "Your password was just changed. If this wasn't you, contact us right away.",
            eyebrow: "Account security",
            title: "Your password was changed",
            recipientName: customer.name,
            status: { label: "Password updated", tone: "success" },
            paragraphs: ["The password on your Paxbook account was changed just now. You can log in with your new password."],
            details: [["When", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST"]],
            cta: { label: "Log in", url: `${frontendUrl}/login` },
            note: "Didn't change your password? Reply to this email or call us straight away so we can secure your account.",
          }),
        )
        .catch(() => undefined);
    }
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

/** Indian mobiles are stored as their last 10 digits; other lengths are kept as entered digits. */
function normalizePhone(raw: string | undefined | null): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/** Older accounts kept phones as typed (+91 98..., 98...), so a lookup tries the usual spellings. */
function phoneVariants(raw: string): string[] {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return [];
  const last10 = digits.slice(-10);
  return [...new Set([raw.trim(), digits, last10, `+91${last10}`, `+91 ${last10}`, `91${last10}`, `0${last10}`])];
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length >= 4 ? `******${d.slice(-4)}` : phone;
}
