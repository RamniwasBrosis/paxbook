import { Body, Controller, Delete, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { FlightCheckoutService } from "./flight-checkout.service";
import { SaveFlightImportantInfoDto } from "./dto/flight-checkout.dto";

/** Admin's editor for the "Important information" block on the flight booking page. */
@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/checkout", version: "1" })
export class AdminFlightCheckoutController {
  constructor(private readonly checkout: FlightCheckoutService) {}

  @Get("important-info")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  getImportantInfo(@CurrentAdmin() admin: RequestAdmin) {
    return this.checkout.getImportantInfo(admin.tenantId);
  }

  @Put("important-info")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  saveImportantInfo(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveFlightImportantInfoDto) {
    return this.checkout.saveImportantInfo(admin.tenantId, dto.sections);
  }

  /** Back to the built-in default text. */
  @Delete("important-info")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  resetImportantInfo(@CurrentAdmin() admin: RequestAdmin) {
    return this.checkout.saveImportantInfo(admin.tenantId, null);
  }
}
