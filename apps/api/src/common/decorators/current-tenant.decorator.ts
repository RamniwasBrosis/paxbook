import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { ResolvedTenant } from "../types/resolved-tenant";

/** Reads the tenant attached by TenantResolverMiddleware — only available on routes it's applied to. */
export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): ResolvedTenant => {
  const request = ctx.switchToHttp().getRequest<Request & { tenant: ResolvedTenant }>();
  return request.tenant;
});
