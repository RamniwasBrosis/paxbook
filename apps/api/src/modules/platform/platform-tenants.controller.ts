import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PlatformOwnerGuard } from "./guards/platform-owner.guard";
import { PlatformTenantsService } from "./platform-tenants.service";
import { UpdateTenantStatusDto } from "./dto/update-tenant-status.dto";

@ApiTags("platform")
@ApiBearerAuth()
@UseGuards(PlatformOwnerGuard)
@Controller({ path: "platform/tenants", version: "1" })
export class PlatformTenantsController {
  constructor(private readonly platformTenantsService: PlatformTenantsService) {}

  @Get()
  findAll() {
    return this.platformTenantsService.findAll();
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTenantStatusDto) {
    return this.platformTenantsService.updateStatus(id, dto);
  }
}
