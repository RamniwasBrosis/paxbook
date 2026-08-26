import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomerNotificationsService } from "./customer-notifications.service";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/notifications", version: "1" })
export class CustomerNotificationsController {
  constructor(private readonly customerNotificationsService: CustomerNotificationsService) {}

  @Get()
  list(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerNotificationsService.list(customer.tenantId, customer.sub);
  }

  @Patch(":id/read")
  markRead(@CurrentCustomer() customer: RequestCustomer, @Param("id") id: string) {
    return this.customerNotificationsService.markRead(customer.tenantId, customer.sub, id);
  }
}
