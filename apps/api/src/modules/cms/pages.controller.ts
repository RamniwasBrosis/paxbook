import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { PagesService } from "./pages.service";
import { SavePageDto } from "./dto/save-page.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/pages", version: "1" })
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.pagesService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SavePageDto) {
    return this.pagesService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SavePageDto) {
    return this.pagesService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.pagesService.remove(admin.tenantId, id);
    return { id };
  }
}
