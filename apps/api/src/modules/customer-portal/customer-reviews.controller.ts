import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomerReviewsService } from "./customer-reviews.service";
import { SubmitReviewDto } from "./dto/submit-review.dto";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@Controller({ path: "customer/reviews", version: "1" })
export class CustomerReviewsController {
  constructor(private readonly customerReviewsService: CustomerReviewsService) {}

  @Get("mine")
  listMine(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerReviewsService.listMine(customer.tenantId, customer.sub);
  }

  @SkipAudit()
  @Post()
  submit(@CurrentCustomer() customer: RequestCustomer, @Body() dto: SubmitReviewDto) {
    return this.customerReviewsService.submit(customer.tenantId, customer.sub, customer.name, dto);
  }
}
