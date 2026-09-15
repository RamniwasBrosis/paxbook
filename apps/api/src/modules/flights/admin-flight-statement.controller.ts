import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { FlightsService } from "./flights.service";
import { FlightStatementQueryDto } from "./dto/flight-statement-query.dto";

/** FTD's real daily transaction statement — booking fees, refunds, commission, markup, TDS,
 * payment charges — for reconciling Paxbook's own records against what FTD actually debited/credited. */
@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/statement", version: "1" })
export class AdminFlightStatementController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  get(@CurrentAdmin() admin: RequestAdmin, @Query() dto: FlightStatementQueryDto) {
    return this.flightsService.getStatement(admin.tenantId, dto.date, dto.refresh ?? false);
  }
}
