import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
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
  status(@CurrentAdmin() admin: RequestAdmin) {
    return this.flightsService.apiStatus(admin.tenantId);
  }

  /** These four proxy the SAME shared-FTD-account methods the real customer booking flow uses
   * (see public-flights.controller.ts) — not gating the service itself would risk breaking real
   * bookings for every tenant. Gating only here restricts the admin's manual debug/test tool to
   * tenants that actually hold the FTD relationship, without touching customer-facing search. */
  @Post("search")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  async search(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SearchFlightDto) {
    await this.flightsService.assertFtdEnabled(admin.tenantId);
    return this.flightsService.search(dto);
  }

  @Post("fare-details")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  async fareDetails(@CurrentAdmin() admin: RequestAdmin, @Body() dto: FlightLookupDto) {
    await this.flightsService.assertFtdEnabled(admin.tenantId);
    return this.flightsService.fareDetails(dto.flightID, dto.refID);
  }

  @Post("price-check")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  async priceCheck(@CurrentAdmin() admin: RequestAdmin, @Body() dto: FlightLookupDto) {
    await this.flightsService.assertFtdEnabled(admin.tenantId);
    return this.flightsService.priceCheck(dto.flightID, dto.refID);
  }

  @Get("fare-rules")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  async fareRules(@CurrentAdmin() admin: RequestAdmin, @Query() dto: FareRulesLookupDto) {
    await this.flightsService.assertFtdEnabled(admin.tenantId);
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
