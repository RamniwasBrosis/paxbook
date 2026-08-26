import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { VisaInfoService } from "./visa-info.service";
import { SaveVisaInfoDto } from "./dto/save-visa-info.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/visa-info", version: "1" })
export class VisaInfoController {
  constructor(private readonly visaInfoService: VisaInfoService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll() {
    return this.visaInfoService.findAll();
  }

  @Put(":countryId")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  upsert(@Param("countryId") countryId: string, @Body() dto: SaveVisaInfoDto) {
    return this.visaInfoService.upsert(countryId, dto);
  }
}
