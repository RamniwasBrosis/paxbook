export interface AuthenticatedCustomerDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tenantId: string;
}

export interface RequestOtpDto {
  phone: string;
}

export interface OtpRequestResultDto {
  sent: true;
  resendAvailableAt: string;
  /** Only present when NODE_ENV !== "production" — no SMS gateway is configured yet. */
  devOtp?: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

export interface RegisterCustomerDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginCustomerDto {
  email: string;
  password: string;
}

export interface IssuedCustomerAuthDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  customer: AuthenticatedCustomerDto;
}
