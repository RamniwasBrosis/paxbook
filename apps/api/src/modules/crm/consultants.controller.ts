import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { ConsultantsService } from "./consultants.service";
import { SaveConsultantDto } from "./dto/save-consultant.dto";
import { UpdateConsultantDto } from "./dto/update-consultant.dto";

@ApiTags("crm")
@ApiBearerAuth()
@Controller({ path: "crm/consultants", version: "1" })
export class ConsultantsController {
  constructor(private readonly consultantsService: ConsultantsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CRM_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.consultantsService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveConsultantDto) {
    return this.consultantsService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdateConsultantDto) {
    return this.consultantsService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.consultantsService.remove(admin.tenantId, id);
    return { id };
  }
}
