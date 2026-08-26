import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AdminDirectoryService } from "./admin-directory.service";

@ApiTags("crm")
@ApiBearerAuth()
@Controller({ path: "crm/admins", version: "1" })
export class AdminDirectoryController {
  constructor(private readonly adminDirectoryService: AdminDirectoryService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CRM_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.adminDirectoryService.findAll(admin.tenantId);
  }
}
