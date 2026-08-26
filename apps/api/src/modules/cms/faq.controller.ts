import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { FaqService } from "./faq.service";
import { SaveFaqItemDto } from "./dto/save-faq-item.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/faq", version: "1" })
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.faqService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveFaqItemDto) {
    return this.faqService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveFaqItemDto) {
    return this.faqService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.faqService.remove(admin.tenantId, id);
    return { id };
  }
}
