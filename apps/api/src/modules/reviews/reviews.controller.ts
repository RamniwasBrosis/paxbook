import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { ReviewsService } from "./reviews.service";
import { SaveReviewDto } from "./dto/save-review.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";

@ApiTags("reviews")
@ApiBearerAuth()
@Controller({ path: "reviews", version: "1" })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.REVIEWS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.reviewsService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.REVIEWS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveReviewDto) {
    return this.reviewsService.create(admin.tenantId, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(PERMISSIONS.REVIEWS_WRITE)
  moderate(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderate(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.REVIEWS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.reviewsService.remove(admin.tenantId, id);
    return { id };
  }
}
