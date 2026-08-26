import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { PlatformOwnerGuard } from "./guards/platform-owner.guard";
import { PlatformPlansService } from "./platform-plans.service";
import { SavePlanDto } from "./dto/save-plan.dto";

@ApiTags("platform")
@Controller({ path: "platform/plans", version: "1" })
export class PlatformPlansController {
  constructor(private readonly platformPlansService: PlatformPlansService) {}

  /** Consumed by the public tenant-signup form — no auth yet at that point. */
  @Public()
  @Get("public")
  findActive() {
    return this.platformPlansService.findActive();
  }

  @ApiBearerAuth()
  @UseGuards(PlatformOwnerGuard)
  @Get()
  findAll() {
    return this.platformPlansService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(PlatformOwnerGuard)
  @Post()
  create(@Body() dto: SavePlanDto) {
    return this.platformPlansService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(PlatformOwnerGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: SavePlanDto) {
    return this.platformPlansService.update(id, dto);
  }
}
