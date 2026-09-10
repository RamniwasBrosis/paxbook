import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AdminFlightBookingsService } from "./admin-flight-bookings.service";
import { AdminCancelFlightBookingDto } from "./dto/cancel-flight-booking.dto";
import { ProcessFlightRefundDto } from "./dto/process-flight-refund.dto";

@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/bookings", version: "1" })
export class AdminFlightBookingsController {
  constructor(private readonly service: AdminFlightBookingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin, @Query("status") status?: string) {
    return this.service.findAll(admin.tenantId, status);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.service.findOne(admin.tenantId, id);
  }

  @Post(":id/cancel")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  cancel(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: AdminCancelFlightBookingDto) {
    return this.service.cancel(admin.tenantId, id, dto.reason, dto.canMode);
  }

  @Post(":id/refund")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  refund(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: ProcessFlightRefundDto) {
    return this.service.refund(admin.tenantId, id, dto.amount, dto.note);
  }
}
