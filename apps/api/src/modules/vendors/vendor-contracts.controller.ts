import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { VendorContractsService } from "./vendor-contracts.service";
import { SaveVendorContractDto } from "./dto/save-vendor-contract.dto";

@ApiTags("vendors")
@ApiBearerAuth()
@Controller({ path: "vendors/:vendorId/contracts", version: "1" })
export class VendorContractsController {
  constructor(private readonly vendorContractsService: VendorContractsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Param("vendorId") vendorId: string, @Body() dto: SaveVendorContractDto) {
    return this.vendorContractsService.create(admin.tenantId, vendorId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("vendorId") vendorId: string, @Param("id") id: string, @Body() dto: SaveVendorContractDto) {
    return this.vendorContractsService.update(admin.tenantId, vendorId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("vendorId") vendorId: string, @Param("id") id: string) {
    await this.vendorContractsService.remove(admin.tenantId, vendorId, id);
    return { id };
  }
}
