import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { PackagesService } from "./packages.service";
import { SavePackageDto } from "./dto/save-package.dto";

@ApiTags("packages")
@ApiBearerAuth()
@Controller({ path: "packages", version: "1" })
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PACKAGES_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.packagesService.findAll(admin.tenantId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.PACKAGES_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.packagesService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.PACKAGES_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SavePackageDto) {
    return this.packagesService.create(admin.tenantId, dto, admin.permissions.includes(PERMISSIONS.PACKAGES_APPROVE));
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.PACKAGES_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SavePackageDto) {
    return this.packagesService.update(admin.tenantId, id, dto, admin.permissions.includes(PERMISSIONS.PACKAGES_APPROVE));
  }

  @Patch(":id/publish")
  @RequirePermissions(PERMISSIONS.PACKAGES_APPROVE)
  publish(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.packagesService.setPublished(admin.tenantId, id, true);
  }

  @Patch(":id/unpublish")
  @RequirePermissions(PERMISSIONS.PACKAGES_APPROVE)
  unpublish(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.packagesService.setPublished(admin.tenantId, id, false);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.PACKAGES_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.packagesService.remove(admin.tenantId, id);
    return { id };
  }
}
