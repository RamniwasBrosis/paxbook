import { Module } from "@nestjs/common";
import { CustomerPortalModule } from "../customer-portal/customer-portal.module";
import { FtdClientService } from "./ftd-client.service";
import { FlightsService } from "./flights.service";
import { FlightPricingService } from "./flight-pricing.service";
import { FlightCancellationEstimateService } from "./flight-cancellation-estimate.service";
import { FlightStatusPollingService } from "./flight-status-polling.service";
import { PublicFlightsController } from "./public-flights.controller";
import { CustomerFlightsController } from "./customer-flights.controller";
import { CustomerFlightTripsController } from "./customer-flight-trips.controller";
import { AdminFlightApiController } from "./admin-flight-api.controller";
import { AdminFlightStatementController } from "./admin-flight-statement.controller";
import { AdminFlightBookingsController } from "./admin-flight-bookings.controller";
import { AdminFlightBookingsService } from "./admin-flight-bookings.service";
import { AdminFlightPricingController } from "./admin-flight-pricing.controller";
import { AdminFlightDashboardController } from "./admin-flight-dashboard.controller";
import { AdminFlightDashboardService } from "./admin-flight-dashboard.service";
import { AdminAirportsController } from "./admin-airports.controller";
import { AirportsService } from "./airports.service";

@Module({
  imports: [CustomerPortalModule],
  controllers: [
    PublicFlightsController,
    CustomerFlightsController,
    CustomerFlightTripsController,
    AdminFlightApiController,
    AdminFlightStatementController,
    AdminFlightBookingsController,
    AdminFlightPricingController,
    AdminFlightDashboardController,
    AdminAirportsController,
  ],
  providers: [FtdClientService, FlightsService, AdminFlightBookingsService, FlightPricingService, FlightCancellationEstimateService, FlightStatusPollingService, AdminFlightDashboardService, AirportsService],
})
export class FlightsModule {}
