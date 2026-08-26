import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestVendor } from "../types/request-vendor";

export const CurrentVendor = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestVendor => {
  const request = ctx.switchToHttp().getRequest<Request & { user: RequestVendor }>();
  return request.user;
});
