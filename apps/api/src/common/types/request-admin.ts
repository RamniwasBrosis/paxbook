import type { PermissionKey } from "@paxbook/config";

/** Shape attached to `req.user` by JwtStrategy.validate(), derived from the access token's claims. */
export interface RequestAdmin {
  sub: string; // AdminUser.id
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  tenantId: string;
  permissions: PermissionKey[];
  isPlatformOwner: boolean;
}
