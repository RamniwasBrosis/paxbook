import { Module } from "@nestjs/common";
import { CustomerPortalModule } from "../customer-portal/customer-portal.module";
import { FtdClientService } from "./ftd-client.service";
import { FlightsService } from "./flights.service";
import { FlightPricingService } from "./flight-pricing.service";
import { PublicFlightsController } from "./public-flights.controller";
import { CustomerFlightsController } from "./customer-flights.controller";
import { AdminFlightApiController } from "./admin-flight-api.controller";
import { AdminFlightBookingsController } from "./admin-flight-bookings.controller";
import { AdminFlightBookingsService } from "./admin-flight-bookings.service";
import { AdminFlightPricingController } from "./admin-flight-pricing.controller";

@Module({
  imports: [CustomerPortalModule],
  controllers: [PublicFlightsController, CustomerFlightsController, AdminFlightApiController, AdminFlightBookingsController, AdminFlightPricingController],
  providers: [FtdClientService, FlightsService, AdminFlightBookingsService, FlightPricingService],
})
export class FlightsModule {}
