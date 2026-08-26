import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import type { VendorCategoryType } from "@paxbook/types";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { VendorsService } from "./vendors.service";
import { SaveVendorDto } from "./dto/save-vendor.dto";
import { ProvisionPortalAccessDto } from "./dto/provision-portal-access.dto";

@ApiTags("vendors")
@ApiBearerAuth()
@Controller({ path: "vendors", version: "1" })
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VENDORS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin, @Query("categoryType") categoryType?: VendorCategoryType) {
    return this.vendorsService.findAll(admin.tenantId, categoryType);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.VENDORS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.vendorsService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveVendorDto) {
    return this.vendorsService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveVendorDto) {
    return this.vendorsService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.vendorsService.remove(admin.tenantId, id);
    return { id };
  }

  @Post(":id/portal-access")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  provisionPortalAccess(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: ProvisionPortalAccessDto) {
    return this.vendorsService.provisionPortalAccess(admin.tenantId, id, dto.email);
  }

  @Post(":id/portal-access/reset-password")
  @RequirePermissions(PERMISSIONS.VENDORS_WRITE)
  resetPortalPassword(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.vendorsService.resetPortalPassword(admin.tenantId, id);
  }
}
