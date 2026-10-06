import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { FlightsService } from "./flights.service";
import { GuestFlightCheckoutService } from "./guest-flight-checkout.service";
import { CreateFlightBookingDto } from "./dto/create-flight-booking.dto";
import { CreateRoundTripFlightBookingDto } from "./dto/create-round-trip-flight-booking.dto";
import { VerifyFlightPaymentDto } from "./dto/verify-flight-payment.dto";

const TOKEN_HEADER = "x-guest-token";

/** Guest (no login) flight checkout. Every call after creation needs the booking's own guest token. */
@ApiTags("flights")
@Public()
@SkipAudit()
@Controller({ path: "public/flights/guest", version: "1" })
export class GuestFlightCheckoutController {
  constructor(
    private readonly guest: GuestFlightCheckoutService,
    private readonly flights: FlightsService,
  ) {}

  @Post("bookings")
  create(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: CreateFlightBookingDto) {
    return this.guest.createBooking(tenant.id, dto);
  }

  @Get("bookings/:id")
  async findOne(@CurrentTenant() tenant: ResolvedTenant, @Param("id") id: string, @Headers(TOKEN_HEADER) token?: string) {
    return this.flights.findOneForCustomer(tenant.id, await this.guest.bookingCustomer(tenant.id, id, token), id);
  }

  @Post("bookings/:id/payment/order")
  async paymentOrder(@CurrentTenant() tenant: ResolvedTenant, @Param("id") id: string, @Headers(TOKEN_HEADER) token?: string) {
    return this.flights.createPaymentOrder(tenant.id, await this.guest.bookingCustomer(tenant.id, id, token), id);
  }

  @Post("bookings/:id/payment/:paymentId/verify")
  async verify(
    @CurrentTenant() tenant: ResolvedTenant,
    @Param("id") id: string,
    @Param("paymentId") paymentId: string,
    @Body() dto: VerifyFlightPaymentDto,
    @Headers(TOKEN_HEADER) token?: string,
  ) {
    return this.flights.confirmBooking(tenant.id, await this.guest.bookingCustomer(tenant.id, id, token), id, paymentId, dto);
  }

  @Post("trips")
  createTrip(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: CreateRoundTripFlightBookingDto) {
    return this.guest.createTrip(tenant.id, dto);
  }

  @Get("trips/:tripId")
  async findTrip(@CurrentTenant() tenant: ResolvedTenant, @Param("tripId") tripId: string, @Headers(TOKEN_HEADER) token?: string) {
    return this.flights.getTrip(tenant.id, await this.guest.tripCustomer(tenant.id, tripId, token), tripId);
  }

  @Post("trips/:tripId/payment/order")
  async tripPaymentOrder(@CurrentTenant() tenant: ResolvedTenant, @Param("tripId") tripId: string, @Headers(TOKEN_HEADER) token?: string) {
    return this.flights.createTripPaymentOrder(tenant.id, await this.guest.tripCustomer(tenant.id, tripId, token), tripId);
  }

  @Post("trips/:tripId/payment/verify")
  async verifyTrip(@CurrentTenant() tenant: ResolvedTenant, @Param("tripId") tripId: string, @Body() dto: VerifyFlightPaymentDto, @Headers(TOKEN_HEADER) token?: string) {
    return this.flights.confirmTripBooking(tenant.id, await this.guest.tripCustomer(tenant.id, tripId, token), tripId, dto);
  }
}
