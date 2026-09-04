import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { FlightsService } from "./flights.service";
import { CreateFlightBookingDto } from "./dto/create-flight-booking.dto";
import { VerifyFlightPaymentDto } from "./dto/verify-flight-payment.dto";

@ApiTags("flights")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/flight-bookings", version: "1" })
export class CustomerFlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  findAll(@CurrentCustomer() customer: RequestCustomer) {
    return this.flightsService.findAllForCustomer(customer.tenantId, customer.sub);
  }

  @Get(":id")
  findOne(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.flightsService.findOneForCustomer(customer.tenantId, customer.sub, id);
  }

  @Post(":id/refresh-status")
  refreshStatus(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.flightsService.refreshStatus(customer.tenantId, customer.sub, id);
  }

  @Post()
  create(@CurrentCustomer() customer: RequestCustomer, @Body() dto: CreateFlightBookingDto) {
    return this.flightsService.createDraftBooking(customer.tenantId, customer.sub, dto, dto.searchContext);
  }

  @Post(":id/payment/order")
  createPaymentOrder(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.flightsService.createPaymentOrder(customer.tenantId, customer.sub, id);
  }

  @Post(":id/payment/:paymentId/verify")
  verifyPayment(
    @CurrentCustomer() customer: RequestCustomer,
    @Param("id") id: string,
    @Param("paymentId") paymentId: string,
    @Body() dto: VerifyFlightPaymentDto,
  ) {
    return this.flightsService.confirmBooking(customer.tenantId, customer.sub, id, paymentId, dto);
  }
}
