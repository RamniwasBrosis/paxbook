import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";
import { VendorJwtAuthGuard } from "../vendor-auth/guards/vendor-jwt-auth.guard";
import { VendorPaymentsService } from "./vendor-payments.service";

@ApiTags("vendor-portal")
@Public()
@UseGuards(VendorJwtAuthGuard)
@Controller({ path: "vendor/payments", version: "1" })
export class VendorPaymentsController {
  constructor(private readonly vendorPaymentsService: VendorPaymentsService) {}

  @Get()
  findAll(@CurrentVendor() vendor: RequestVendor) {
    return this.vendorPaymentsService.findAll(vendor.tenantId, vendor.sub);
  }
}
