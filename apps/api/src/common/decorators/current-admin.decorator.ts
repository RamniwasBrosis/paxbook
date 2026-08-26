import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestAdmin } from "../types/request-admin";

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestAdmin => {
  const request = ctx.switchToHttp().getRequest<Request & { user: RequestAdmin }>();
  return request.user;
});
