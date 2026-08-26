import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { VendorPaymentsService } from "./vendor-payments.service";
import { SaveVendorPaymentDto } from "./dto/save-vendor-payment.dto";

@ApiTags("vendors")
@ApiBearerAuth()
@Controller({ path: "vendor-payments", version: "1" })
export class VendorPaymentsController {
  constructor(private readonly vendorPaymentsService: VendorPaymentsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VENDORS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin, @Query("vendorId") vendorId?: string) {
    return this.vendorPaymentsService.findAll(admin.tenantId, vendorId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveVendorPaymentDto) {
    return this.vendorPaymentsService.create(admin.tenantId, dto);
  }

  @Patch(":id/mark-paid")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  markPaid(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.vendorPaymentsService.markPaid(admin.tenantId, id);
  }
}
