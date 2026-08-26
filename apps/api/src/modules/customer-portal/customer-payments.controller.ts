import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomerPaymentsService } from "./customer-payments.service";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/bookings/:bookingId/payment", version: "1" })
export class CustomerPaymentsController {
  constructor(private readonly customerPaymentsService: CustomerPaymentsService) {}

  @Post("order")
  createOrder(@CurrentCustomer() customer: RequestCustomer, @Param("bookingId") bookingId: string) {
    return this.customerPaymentsService.createOrder(customer.tenantId, customer.sub, bookingId);
  }

  @Post(":paymentId/verify")
  verifyPayment(
    @CurrentCustomer() customer: RequestCustomer,
    @Param("bookingId") bookingId: string,
    @Param("paymentId") paymentId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.customerPaymentsService.verifyPayment(customer.tenantId, customer.sub, bookingId, paymentId, dto);
  }
}
