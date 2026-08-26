import type { PermissionKey } from "@paxbook/config";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthenticatedAdminDto {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
  tenantId: string;
  isPlatformOwner: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  admin: AuthenticatedAdminDto;
}

export interface RefreshResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  admin: AuthenticatedAdminDto;
}
