import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { tap, type Observable } from "rxjs";
import { SKIP_AUDIT_KEY } from "../decorators/skip-audit.decorator";
import type { RequestAdmin } from "../types/request-admin";
import { AuditLogService } from "../../modules/audit-log/audit-log.service";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const VERSION_SEGMENT = /^v\d+$/i;
const SENSITIVE_FIELDS = new Set(["password", "passwordHash", "token", "accessToken", "refreshToken", "secret"]);

function redactSensitiveFields(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [
      key,
      SENSITIVE_FIELDS.has(key) ? "[REDACTED]" : value,
    ]),
  );
}

/**
 * Applied globally. Logs every mutating request from an authenticated admin,
 * opt-out via @SkipAudit() rather than opt-in, so nothing is missed by
 * omission. Generic by design: it records the request body as the "diff"
 * rather than a true before/after entity diff, since it has no per-module
 * knowledge of what changed — modules that need a precise before/after audit
 * trail can additionally call AuditLogService.record() directly.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestAdmin }>();

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const shouldAudit = !skip && MUTATING_METHODS.has(request.method) && !!request.user;

    return next.handle().pipe(
      tap((result) => {
        if (!shouldAudit || !request.user) return;

        const segments = request.path.split("/").filter((seg) => seg && seg !== "api" && !VERSION_SEGMENT.test(seg));
        const entityType = segments[0] ?? "unknown";
        const entityId =
          (request.params && (request.params as Record<string, string>).id) ||
          (result && typeof result === "object" && "id" in result ? String((result as { id: unknown }).id) : "unknown");

        void this.auditLogService.record({
          tenantId: request.user.tenantId,
          actorAdminId: request.user.sub,
          action: `${request.method} ${request.path}`,
          entityType,
          entityId,
          diffJson: { requestBody: redactSensitiveFields(request.body) ?? null },
          ipAddress: request.ip,
        });
      }),
    );
  }
}
