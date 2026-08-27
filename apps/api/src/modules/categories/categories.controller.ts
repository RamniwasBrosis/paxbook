import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CategoriesService } from "./categories.service";
import { SaveCategoryDto } from "./dto/save-category.dto";

@ApiTags("categories")
@ApiBearerAuth()
@Controller({ path: "categories", version: "1" })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CATEGORIES_READ)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CATEGORIES_WRITE)
  create(@Body() dto: SaveCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CATEGORIES_WRITE)
  update(@Param("id") id: string, @Body() dto: SaveCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CATEGORIES_WRITE)
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }
}
