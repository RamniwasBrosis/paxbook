import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AuditLogService } from "./audit-log.service";

@ApiTags("audit-log")
@ApiBearerAuth()
@Controller({ path: "audit-log", version: "1" })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_LOG_READ)
  findAll(
    @CurrentAdmin() admin: RequestAdmin,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "20",
  ) {
    return this.auditLogService.findAll(admin.tenantId, Number(page), Number(pageSize));
  }
}
