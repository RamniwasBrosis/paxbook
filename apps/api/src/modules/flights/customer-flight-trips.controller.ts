import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { FlightsService } from "./flights.service";
import { VerifyFlightPaymentDto } from "./dto/verify-flight-payment.dto";

/** A domestic round trip — two linked one-way FlightBookings sharing a tripId, paid for together.
 * See FlightsService.createRoundTripDraftBooking for why it's modeled this way. */
@ApiTags("flights")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/flight-trips", version: "1" })
export class CustomerFlightTripsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get(":tripId")
  findOne(@CurrentCustomer() customer: RequestCustomer, @Param("tripId") tripId: string) {
    return this.flightsService.getTrip(customer.tenantId, customer.sub, tripId);
  }

  @Post(":tripId/payment/order")
  createPaymentOrder(@CurrentCustomer() customer: RequestCustomer, @Param("tripId") tripId: string) {
    return this.flightsService.createTripPaymentOrder(customer.tenantId, customer.sub, tripId);
  }

  @Post(":tripId/payment/verify")
  verifyPayment(@CurrentCustomer() customer: RequestCustomer, @Param("tripId") tripId: string, @Body() dto: VerifyFlightPaymentDto) {
    return this.flightsService.confirmTripBooking(customer.tenantId, customer.sub, tripId, dto);
  }
}
