import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { TestimonialsService } from "./testimonials.service";
import { SaveTestimonialDto } from "./dto/save-testimonial.dto";

@ApiTags("testimonials")
@ApiBearerAuth()
@Controller({ path: "testimonials", version: "1" })
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.testimonialsService.findAll(admin.tenantId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.testimonialsService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveTestimonialDto) {
    return this.testimonialsService.create(admin.tenantId, dto, admin.permissions.includes(PERMISSIONS.TESTIMONIALS_APPROVE));
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveTestimonialDto) {
    return this.testimonialsService.update(admin.tenantId, id, dto, admin.permissions.includes(PERMISSIONS.TESTIMONIALS_APPROVE));
  }

  @Patch(":id/publish")
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_APPROVE)
  publish(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.testimonialsService.setPublished(admin.tenantId, id, true);
  }

  @Patch(":id/unpublish")
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_APPROVE)
  unpublish(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.testimonialsService.setPublished(admin.tenantId, id, false);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.TESTIMONIALS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.testimonialsService.remove(admin.tenantId, id);
    return { id };
  }
}
