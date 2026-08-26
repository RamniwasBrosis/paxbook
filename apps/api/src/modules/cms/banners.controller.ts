import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { BannersService } from "./banners.service";
import { SaveBannerDto } from "./dto/save-banner.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/banners", version: "1" })
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.bannersService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveBannerDto) {
    return this.bannersService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveBannerDto) {
    return this.bannersService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.bannersService.remove(admin.tenantId, id);
    return { id };
  }
}
