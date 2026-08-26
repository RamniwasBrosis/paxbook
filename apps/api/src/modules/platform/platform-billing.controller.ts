import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { PlatformBillingService } from "./platform-billing.service";
import { ConfirmBillingActivationDto } from "./dto/confirm-billing-activation.dto";

@ApiTags("settings")
@ApiBearerAuth()
@Controller({ path: "settings/billing", version: "1" })
export class PlatformBillingController {
  constructor(private readonly platformBillingService: PlatformBillingService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_READ)
  getSubscription(@CurrentAdmin() admin: RequestAdmin) {
    return this.platformBillingService.getSubscription(admin.tenantId);
  }

  @Post("activate")
  @RequirePermissions(PERMISSIONS.SETTINGS_WRITE)
  createActivationOrder(@CurrentAdmin() admin: RequestAdmin) {
    return this.platformBillingService.createActivationOrder(admin.tenantId);
  }

  @Post("confirm")
  @RequirePermissions(PERMISSIONS.SETTINGS_WRITE)
  confirmActivation(@CurrentAdmin() admin: RequestAdmin, @Body() dto: ConfirmBillingActivationDto) {
    return this.platformBillingService.confirmActivation(admin.tenantId, dto);
  }
}
