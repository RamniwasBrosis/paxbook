import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { FlightsService } from "./flights.service";
import { SearchFlightDto } from "./dto/search-flight.dto";
import { FareRulesLookupDto, FlightLookupDto } from "./dto/flight-lookup.dto";

/** Search, fare details, price check, fare rules — no login required, matching the rest of the public browsing flow. */
@ApiTags("flights")
@Public()
@SkipAudit()
@Controller({ path: "public/flights", version: "1" })
export class PublicFlightsController {
  constructor(private readonly flightsService: FlightsService) {}

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

  @Get("fare-rules")
  fareRules(@Query() dto: FareRulesLookupDto) {
    return this.flightsService.fareRules(dto.flightID);
  }
}
