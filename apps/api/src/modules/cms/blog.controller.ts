import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { BlogService } from "./blog.service";
import { SaveBlogPostDto } from "./dto/save-blog-post.dto";

@ApiTags("cms")
@ApiBearerAuth()
@Controller({ path: "cms/blog", version: "1" })
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CMS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.blogService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveBlogPostDto) {
    return this.blogService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveBlogPostDto) {
    return this.blogService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CMS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.blogService.remove(admin.tenantId, id);
    return { id };
  }
}
