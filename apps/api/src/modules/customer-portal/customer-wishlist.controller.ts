import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomerWishlistService } from "./customer-wishlist.service";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/wishlist", version: "1" })
export class CustomerWishlistController {
  constructor(private readonly customerWishlistService: CustomerWishlistService) {}

  @Get()
  list(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerWishlistService.list(customer.tenantId, customer.sub);
  }

  @Post(":packageId")
  add(@CurrentCustomer() customer: RequestCustomer, @Param("packageId") packageId: string) {
    return this.customerWishlistService.add(customer.tenantId, customer.sub, packageId);
  }

  @Delete(":packageId")
  remove(@CurrentCustomer() customer: RequestCustomer, @Param("packageId") packageId: string) {
    return this.customerWishlistService.remove(customer.tenantId, customer.sub, packageId);
  }
}
