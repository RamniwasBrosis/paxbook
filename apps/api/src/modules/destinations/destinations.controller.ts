import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { DestinationsService } from "./destinations.service";
import { CreateDestinationDto } from "./dto/create-destination.dto";
import { UpdateDestinationDto } from "./dto/update-destination.dto";
import {
  SaveDestinationActivityDto,
  SaveDestinationHighlightDto,
  SaveDestinationHotelSuggestionDto,
} from "./dto/destination-content.dto";

@ApiTags("destinations")
@ApiBearerAuth()
@Controller({ path: "destinations", version: "1" })
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.destinationsService.findAll(admin.tenantId);
  }

  // Registered before ":id" so "countries"/"categories" aren't parsed as a destination id.
  @Get("countries")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  listCountries() {
    return this.destinationsService.listCountries();
  }

  @Get("categories")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  listCategories() {
    return this.destinationsService.listCategories();
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.destinationsService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: CreateDestinationDto) {
    return this.destinationsService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdateDestinationDto) {
    return this.destinationsService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.destinationsService.remove(admin.tenantId, id);
    return { id };
  }

  // --- Highlights ("things to do") ---

  @Get(":id/highlights")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  listHighlights(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.destinationsService.listHighlights(admin.tenantId, id);
  }

  @Post(":id/highlights")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  createHighlight(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveDestinationHighlightDto) {
    return this.destinationsService.createHighlight(admin.tenantId, id, dto);
  }

  @Patch(":id/highlights/:highlightId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  updateHighlight(
    @CurrentAdmin() admin: RequestAdmin,
    @Param("id") id: string,
    @Param("highlightId") highlightId: string,
    @Body() dto: SaveDestinationHighlightDto,
  ) {
    return this.destinationsService.updateHighlight(admin.tenantId, id, highlightId, dto);
  }

  @Delete(":id/highlights/:highlightId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  async removeHighlight(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Param("highlightId") highlightId: string) {
    await this.destinationsService.removeHighlight(admin.tenantId, id, highlightId);
    return { id: highlightId };
  }

  // --- Activities ("activities we can add") ---

  @Get(":id/activities")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  listActivities(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.destinationsService.listActivities(admin.tenantId, id);
  }

  @Post(":id/activities")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  createActivity(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveDestinationActivityDto) {
    return this.destinationsService.createActivity(admin.tenantId, id, dto);
  }

  @Patch(":id/activities/:activityId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  updateActivity(
    @CurrentAdmin() admin: RequestAdmin,
    @Param("id") id: string,
    @Param("activityId") activityId: string,
    @Body() dto: SaveDestinationActivityDto,
  ) {
    return this.destinationsService.updateActivity(admin.tenantId, id, activityId, dto);
  }

  @Delete(":id/activities/:activityId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  async removeActivity(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Param("activityId") activityId: string) {
    await this.destinationsService.removeActivity(admin.tenantId, id, activityId);
    return { id: activityId };
  }

  // --- Hotel suggestions ("where you could stay") ---

  @Get(":id/hotel-suggestions")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_READ)
  listHotelSuggestions(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.destinationsService.listHotelSuggestions(admin.tenantId, id);
  }

  @Post(":id/hotel-suggestions")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  createHotelSuggestion(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveDestinationHotelSuggestionDto) {
    return this.destinationsService.createHotelSuggestion(admin.tenantId, id, dto);
  }

  @Patch(":id/hotel-suggestions/:hotelId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  updateHotelSuggestion(
    @CurrentAdmin() admin: RequestAdmin,
    @Param("id") id: string,
    @Param("hotelId") hotelId: string,
    @Body() dto: SaveDestinationHotelSuggestionDto,
  ) {
    return this.destinationsService.updateHotelSuggestion(admin.tenantId, id, hotelId, dto);
  }

  @Delete(":id/hotel-suggestions/:hotelId")
  @RequirePermissions(PERMISSIONS.DESTINATIONS_WRITE)
  async removeHotelSuggestion(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Param("hotelId") hotelId: string) {
    await this.destinationsService.removeHotelSuggestion(admin.tenantId, id, hotelId);
    return { id: hotelId };
  }
}
