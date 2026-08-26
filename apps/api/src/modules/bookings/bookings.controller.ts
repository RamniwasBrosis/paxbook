import { Body, Controller, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { BookingsService } from "./bookings.service";
import { SaveBookingDto } from "./dto/save-booking.dto";
import { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import { SyncBookingTravelersDto } from "./dto/sync-booking-travelers.dto";
import { SaveBookingVoucherDto } from "./dto/save-booking-voucher.dto";

@ApiTags("bookings")
@ApiBearerAuth()
@Controller({ path: "bookings", version: "1" })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.BOOKINGS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.bookingsService.findAll(admin.tenantId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.BOOKINGS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.bookingsService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveBookingDto) {
    return this.bookingsService.create(admin.tenantId, admin.sub, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveBookingDto) {
    return this.bookingsService.update(admin.tenantId, id, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  setStatus(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.setStatus(admin.tenantId, id, admin.sub, dto);
  }

  @Patch(":id/travelers")
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  syncTravelers(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SyncBookingTravelersDto) {
    return this.bookingsService.syncTravelers(admin.tenantId, id, dto);
  }

  @Put(":id/voucher")
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  upsertVoucher(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveBookingVoucherDto) {
    return this.bookingsService.upsertVoucher(admin.tenantId, id, dto);
  }
}
