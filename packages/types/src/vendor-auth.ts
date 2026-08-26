import type { VendorCategoryType } from "./vendor.js";

export interface AuthenticatedVendorDto {
  id: string;
  name: string;
  email: string | null;
  categoryType: VendorCategoryType;
  tenantId: string;
}

export interface LoginVendorDto {
  email: string;
  password: string;
}

export interface IssuedVendorAuthDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  vendor: AuthenticatedVendorDto;
}
