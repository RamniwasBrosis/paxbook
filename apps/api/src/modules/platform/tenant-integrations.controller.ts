import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { TenantIntegrationsService } from "./tenant-integrations.service";
import { UpdateTenantIntegrationsDto } from "./dto/update-tenant-integrations.dto";

@ApiTags("settings")
@ApiBearerAuth()
@Controller({ path: "settings/integrations", version: "1" })
export class TenantIntegrationsController {
  constructor(private readonly tenantIntegrationsService: TenantIntegrationsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_READ)
  getIntegrations(@CurrentAdmin() admin: RequestAdmin) {
    return this.tenantIntegrationsService.getIntegrations(admin.tenantId);
  }

  @Patch()
  @RequirePermissions(PERMISSIONS.SETTINGS_WRITE)
  updateIntegrations(@CurrentAdmin() admin: RequestAdmin, @Body() dto: UpdateTenantIntegrationsDto) {
    return this.tenantIntegrationsService.updateIntegrations(admin.tenantId, dto);
  }
}
