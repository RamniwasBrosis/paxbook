import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { EmiPlansService } from "./emi-plans.service";
import { SaveEmiPlanDto } from "./dto/save-emi-plan.dto";

@ApiTags("finance")
@ApiBearerAuth()
@Controller({ path: "bookings/:bookingId/emi-plan", version: "1" })
export class EmiPlansController {
  constructor(private readonly emiPlansService: EmiPlansService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("bookingId") bookingId: string) {
    return this.emiPlansService.findOne(admin.tenantId, bookingId);
  }

  @Put()
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  upsert(@CurrentAdmin() admin: RequestAdmin, @Param("bookingId") bookingId: string, @Body() dto: SaveEmiPlanDto) {
    return this.emiPlansService.upsert(admin.tenantId, bookingId, dto);
  }

  @Delete()
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("bookingId") bookingId: string) {
    await this.emiPlansService.remove(admin.tenantId, bookingId);
    return { bookingId };
  }
}
