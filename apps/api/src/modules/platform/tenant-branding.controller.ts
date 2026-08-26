import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { TenantBrandingService } from "./tenant-branding.service";
import { UpdateTenantBrandingDto } from "./dto/update-tenant-branding.dto";

@ApiTags("settings")
@ApiBearerAuth()
@Controller({ path: "settings/branding", version: "1" })
export class TenantBrandingController {
  constructor(private readonly tenantBrandingService: TenantBrandingService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_READ)
  getBranding(@CurrentAdmin() admin: RequestAdmin) {
    return this.tenantBrandingService.getBranding(admin.tenantId);
  }

  @Patch()
  @RequirePermissions(PERMISSIONS.SETTINGS_WRITE)
  updateBranding(@CurrentAdmin() admin: RequestAdmin, @Body() dto: UpdateTenantBrandingDto) {
    return this.tenantBrandingService.updateBranding(admin.tenantId, dto);
  }
}
