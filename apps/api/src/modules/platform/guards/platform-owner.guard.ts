import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestAdmin } from "../../../common/types/request-admin";

/** Gates platform-management routes on the binary isPlatformOwner flag — no permission-key involved, since this sits above any single tenant's RBAC. */
@Injectable()
export class PlatformOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestAdmin }>();
    if (!request.user?.isPlatformOwner) {
      throw new ForbiddenException({ code: "PLATFORM_OWNER_REQUIRED", message: "This action requires platform owner access." });
    }
    return true;
  }
}
