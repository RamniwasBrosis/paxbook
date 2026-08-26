import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { TasksService } from "./tasks.service";
import { SaveTaskDto } from "./dto/save-task.dto";

@ApiTags("crm")
@ApiBearerAuth()
@Controller({ path: "crm/tasks", version: "1" })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CRM_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.tasksService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveTaskDto) {
    return this.tasksService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveTaskDto) {
    return this.tasksService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.tasksService.remove(admin.tenantId, id);
    return { id };
  }
}
