import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestCustomer } from "../types/request-customer";

export const CurrentCustomer = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestCustomer => {
  const request = ctx.switchToHttp().getRequest<Request & { user: RequestCustomer }>();
  return request.user;
});
