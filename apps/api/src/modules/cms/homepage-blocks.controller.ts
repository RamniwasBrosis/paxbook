import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { HomepageBlocksService } from "./homepage-blocks.service";
import { SaveHomepageBlockDto } from "./dto/save-homepage-block.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/homepage-blocks", version: "1" })
export class HomepageBlocksController {
  constructor(private readonly homepageBlocksService: HomepageBlocksService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.homepageBlocksService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveHomepageBlockDto) {
    return this.homepageBlocksService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveHomepageBlockDto) {
    return this.homepageBlocksService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.homepageBlocksService.remove(admin.tenantId, id);
    return { id };
  }
}
