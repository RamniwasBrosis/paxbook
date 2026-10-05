import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { FlightsService } from "./flights.service";
import { AirportsService } from "./airports.service";
import { FlightCheckoutService } from "./flight-checkout.service";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { QuoteFlightCouponDto } from "./dto/flight-checkout.dto";
import { SearchFlightDto } from "./dto/search-flight.dto";
import { FareRulesLookupDto, FlightLookupDto } from "./dto/flight-lookup.dto";
import { FlightSeatLookupDto } from "./dto/flight-seat-lookup.dto";

/** Search, fare details, price check, fare rules — no login required, matching the rest of the public browsing flow. */
@ApiTags("flights")
@Public()
@SkipAudit()
@Controller({ path: "public/flights", version: "1" })
export class PublicFlightsController {
  constructor(
    private readonly flightsService: FlightsService,
    private readonly airportsService: AirportsService,
    private readonly checkout: FlightCheckoutService,
  ) {}

  @Get("important-info")
  importantInfo(@CurrentTenant() tenant: ResolvedTenant) {
    return this.checkout.getImportantInfo(tenant.id);
  }

  @Get("coupons")
  coupons(@CurrentTenant() tenant: ResolvedTenant) {
    return this.checkout.listCoupons(tenant.id);
  }

  /** Tighter limit than the global one so codes can't be guessed by brute force. */
  @Post("coupons/quote")
  @HttpCode(200)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  quoteCoupon(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: QuoteFlightCouponDto) {
    return this.checkout.quote(tenant.id, dto.code, dto.amount);
  }

  @Get("airports")
  airports() {
    return this.airportsService.listActive();
  }

  @Post("search")
  search(@Body() dto: SearchFlightDto) {
    return this.flightsService.search(dto);
  }

  @Post("fare-details")
  fareDetails(@Body() dto: FlightLookupDto) {
    return this.flightsService.fareDetails(dto.flightID, dto.refID);
  }

  @Post("price-check")
  priceCheck(@Body() dto: FlightLookupDto) {
    return this.flightsService.priceCheck(dto.flightID, dto.refID);
  }

  @Post("seats")
  seats(@Body() dto: FlightSeatLookupDto) {
    return this.flightsService.seats(dto.flightID, dto.refID, dto.passengers);
  }

  @Get("fare-rules")
  fareRules(@Query() dto: FareRulesLookupDto) {
    return this.flightsService.fareRulesForCustomer(dto.flightID);
  }
}
