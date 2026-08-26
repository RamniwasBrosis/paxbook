import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { UsersService } from "./users.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";

@ApiTags("users")
@ApiBearerAuth()
@Controller({ path: "users", version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.usersService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: CreateAdminUserDto) {
    return this.usersService.create(admin.tenantId, dto);
  }
}
