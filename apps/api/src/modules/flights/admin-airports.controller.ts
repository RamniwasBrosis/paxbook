import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { AirportsService } from "./airports.service";
import { SaveAirportDto, UpdateAirportDto } from "./dto/save-airport.dto";

@ApiTags("flights-admin")
@ApiBearerAuth()
@Controller({ path: "admin/flights/airports", version: "1" })
export class AdminAirportsController {
  constructor(private readonly airports: AirportsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FLIGHTS_READ)
  listAll() {
    return this.airports.listAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  create(@Body() dto: SaveAirportDto) {
    return this.airports.create(dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  update(@Param("id") id: string, @Body() dto: UpdateAirportDto) {
    return this.airports.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.FLIGHTS_WRITE)
  async delete(@Param("id") id: string) {
    await this.airports.delete(id);
    return { id };
  }
}
