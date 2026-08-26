import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";
import { VendorJwtAuthGuard } from "../vendor-auth/guards/vendor-jwt-auth.guard";
import { VendorContractsService } from "./vendor-contracts.service";
import { UpdateVendorContractDocumentDto } from "./dto/update-vendor-contract-document.dto";

@ApiTags("vendor-portal")
@Public()
@UseGuards(VendorJwtAuthGuard)
@Controller({ path: "vendor/contracts", version: "1" })
export class VendorContractsController {
  constructor(private readonly vendorContractsService: VendorContractsService) {}

  @Get()
  findAll(@CurrentVendor() vendor: RequestVendor) {
    return this.vendorContractsService.findAll(vendor.tenantId, vendor.sub);
  }

  @SkipAudit()
  @Patch(":id/document")
  updateDocument(@CurrentVendor() vendor: RequestVendor, @Param("id") id: string, @Body() dto: UpdateVendorContractDocumentDto) {
    return this.vendorContractsService.updateDocument(vendor.tenantId, vendor.sub, id, dto);
  }
}
