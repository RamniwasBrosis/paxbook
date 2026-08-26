import { Injectable, ForbiddenException, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { PermissionKey } from "@paxbook/config";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import type { RequestAdmin } from "../types/request-admin";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: RequestAdmin }>();
    const admin = request.user;

    const missing = required.filter((p) => !admin?.permissions?.includes(p));
    if (missing.length > 0) {
      throw new ForbiddenException({
        code: "INSUFFICIENT_PERMISSIONS",
        message: `Missing required permission(s): ${missing.join(", ")}`,
      });
    }
    return true;
  }
}
