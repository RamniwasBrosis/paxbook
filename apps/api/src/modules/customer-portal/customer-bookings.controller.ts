import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomerBookingsService } from "./customer-bookings.service";
import { CreateBookingRequestDto } from "./dto/create-booking-request.dto";
import { CreateCancellationRequestDto } from "./dto/create-cancellation-request.dto";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@Controller({ path: "customer/bookings", version: "1" })
export class CustomerBookingsController {
  constructor(private readonly customerBookingsService: CustomerBookingsService) {}

  @Get()
  findAll(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerBookingsService.findAll(customer.tenantId, customer.sub);
  }

  @Get("cancellation-requests")
  listMyCancellationRequests(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerBookingsService.listMyCancellationRequests(customer.tenantId, customer.sub);
  }

  @Get(":id")
  findOne(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.customerBookingsService.findOne(customer.tenantId, customer.sub, id);
  }

  @Get(":id/invoice")
  getInvoice(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.customerBookingsService.getInvoice(customer.tenantId, customer.sub, id);
  }

  @Get(":id/voucher")
  getVoucher(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.customerBookingsService.getVoucher(customer.tenantId, customer.sub, id);
  }

  @SkipAudit()
  @Post()
  createBookingRequest(@CurrentCustomer() customer: RequestCustomer, @Body() dto: CreateBookingRequestDto) {
    return this.customerBookingsService.createBookingRequest(customer.tenantId, customer.sub, dto);
  }

  @SkipAudit()
  @Post(":id/cancellation-request")
  requestCancellation(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string, @Body() dto: CreateCancellationRequestDto) {
    return this.customerBookingsService.requestCancellation(customer.tenantId, customer.sub, id, dto);
  }
}
