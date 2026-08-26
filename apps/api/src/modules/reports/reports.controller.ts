import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { ReportsService } from "./reports.service";

@ApiTags("reports")
@ApiBearerAuth()
@Controller({ path: "reports", version: "1" })
@RequirePermissions(PERMISSIONS.REPORTS_READ)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("sales")
  getSales(@CurrentAdmin() admin: RequestAdmin) {
    return this.reportsService.getSalesReport(admin.tenantId);
  }

  @Get("revenue")
  getRevenue(@CurrentAdmin() admin: RequestAdmin) {
    return this.reportsService.getRevenueReport(admin.tenantId);
  }

  @Get("consultants")
  getConsultants(@CurrentAdmin() admin: RequestAdmin) {
    return this.reportsService.getConsultantPerformance(admin.tenantId);
  }

  @Get("marketing")
  getMarketing(@CurrentAdmin() admin: RequestAdmin) {
    return this.reportsService.getMarketingReport(admin.tenantId);
  }

  @Get("satisfaction")
  getSatisfaction(@CurrentAdmin() admin: RequestAdmin) {
    return this.reportsService.getSatisfactionReport(admin.tenantId);
  }
}
