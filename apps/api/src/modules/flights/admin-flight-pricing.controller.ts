import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { FlightPricingService } from "./flight-pricing.service";
import { UpdateFlightPricingSettingDto } from "./dto/update-flight-pricing-setting.dto";
import { SaveFlightRoutePricingRuleDto, UpdateFlightRoutePricingRuleDto } from "./dto/save-flight-route-pricing-rule.dto";

/** Admin's "Flight Pricing" section — the margin/discount applied on top of the provider's real fares. */
@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/pricing", version: "1" })
export class AdminFlightPricingController {
  constructor(private readonly pricing: FlightPricingService) {}

  @Get("settings")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  getSetting() {
    return this.pricing.getSetting();
  }

  @Patch("settings")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  updateSetting(@Body() dto: UpdateFlightPricingSettingDto) {
    return this.pricing.updateSetting(dto.marginPercent, dto.marginFlat);
  }

  @Get("routes")
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  listRoutes() {
    return this.pricing.listRoutes();
  }

  @Post("routes")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  createRoute(@Body() dto: SaveFlightRoutePricingRuleDto) {
    return this.pricing.createRoute(dto.depCity, dto.arrCity, dto.marginPercent, dto.marginFlat, dto.isActive ?? true);
  }

  @Patch("routes/:id")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  updateRoute(@Param("id") id: string, @Body() dto: UpdateFlightRoutePricingRuleDto) {
    return this.pricing.updateRoute(id, dto);
  }

  @Delete("routes/:id")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  async deleteRoute(@Param("id") id: string) {
    await this.pricing.deleteRoute(id);
    return { id };
  }
}
