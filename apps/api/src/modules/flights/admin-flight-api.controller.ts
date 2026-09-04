import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FlightsService } from "./flights.service";
import { SearchFlightDto } from "./dto/search-flight.dto";
import { FareRulesLookupDto, FlightLookupDto } from "./dto/flight-lookup.dto";

/** Admin's "Flight API" section — live search/verify tool against the real provider, plus the call log for debugging. */
@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/api", version: "1" })
export class AdminFlightApiController {
  constructor(
    private readonly flightsService: FlightsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("status")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  status() {
    return this.flightsService.apiStatus();
  }

  @Post("search")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  search(@Body() dto: SearchFlightDto) {
    return this.flightsService.search(dto);
  }

  @Post("fare-details")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  fareDetails(@Body() dto: FlightLookupDto) {
    return this.flightsService.fareDetails(dto.flightID, dto.refID);
  }

  @Post("price-check")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  priceCheck(@Body() dto: FlightLookupDto) {
    return this.flightsService.priceCheck(dto.flightID, dto.refID);
  }

  @Get("fare-rules")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  fareRules(@Query() dto: FareRulesLookupDto) {
    return this.flightsService.fareRules(dto.flightID);
  }

  @Get("logs")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  async logs(@Query("limit") limit?: string, @Query("endpoint") endpoint?: string, @Query("success") success?: string) {
    const take = Math.min(Number(limit) || 50, 200);
    const logs = await this.prisma.flightApiLog.findMany({
      where: {
        ...(endpoint ? { endpoint } : {}),
        ...(success !== undefined ? { success: success === "true" } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    });
    return logs.map((l) => ({
      id: l.id,
      endpoint: l.endpoint,
      requestBody: l.requestBody,
      responseBody: l.responseBody,
      statusCode: l.statusCode,
      success: l.success,
      errorMessage: l.errorMessage,
      durationMs: l.durationMs,
      createdAt: l.createdAt.toISOString(),
    }));
  }
}
