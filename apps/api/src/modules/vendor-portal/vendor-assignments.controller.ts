import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";
import { VendorJwtAuthGuard } from "../vendor-auth/guards/vendor-jwt-auth.guard";
import { VendorAssignmentsService } from "./vendor-assignments.service";

@ApiTags("vendor-portal")
@Public()
@UseGuards(VendorJwtAuthGuard)
@Controller({ path: "vendor/assignments", version: "1" })
export class VendorAssignmentsController {
  constructor(private readonly vendorAssignmentsService: VendorAssignmentsService) {}

  @Get()
  findAll(@CurrentVendor() vendor: RequestVendor) {
    return this.vendorAssignmentsService.findAll(vendor.tenantId, vendor.sub);
  }
}
