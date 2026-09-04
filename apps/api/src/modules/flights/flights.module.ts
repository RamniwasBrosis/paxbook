import { Module } from "@nestjs/common";
import { CustomerPortalModule } from "../customer-portal/customer-portal.module";
import { FtdClientService } from "./ftd-client.service";
import { FlightsService } from "./flights.service";
import { PublicFlightsController } from "./public-flights.controller";
import { CustomerFlightsController } from "./customer-flights.controller";
import { AdminFlightApiController } from "./admin-flight-api.controller";
import { AdminFlightBookingsController } from "./admin-flight-bookings.controller";
import { AdminFlightBookingsService } from "./admin-flight-bookings.service";

@Module({
  imports: [CustomerPortalModule],
  controllers: [PublicFlightsController, CustomerFlightsController, AdminFlightApiController, AdminFlightBookingsController],
  providers: [FtdClientService, FlightsService, AdminFlightBookingsService],
})
export class FlightsModule {}
