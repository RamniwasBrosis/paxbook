import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AdminFlightDashboardService } from "./admin-flight-dashboard.service";

@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/dashboard", version: "1" })
export class AdminFlightDashboardController {
  constructor(private readonly service: AdminFlightDashboardService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  get(@CurrentAdmin() admin: RequestAdmin) {
    return this.service.getDashboard(admin.tenantId);
  }
}
