import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { OffersService } from "./offers.service";
import { SaveCouponDto } from "./dto/save-coupon.dto";

@ApiTags("offers")
@ApiBearerAuth()
@Controller({ path: "offers", version: "1" })
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.OFFERS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.offersService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.OFFERS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveCouponDto) {
    return this.offersService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.OFFERS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveCouponDto) {
    return this.offersService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.OFFERS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.offersService.remove(admin.tenantId, id);
    return { id };
  }
}
