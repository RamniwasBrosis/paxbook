import { SetMetadata } from "@nestjs/common";
import type { PermissionKey } from "@paxbook/config";

export const PERMISSIONS_KEY = "requiredPermissions";

/** Route requires the current admin's JWT to carry ALL listed permission keys. */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
