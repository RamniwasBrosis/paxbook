import { Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../decorators/require-permissions.decorator";
import { BackupService } from "./backup.service";

@ApiTags("settings")
@ApiBearerAuth()
@Controller({ path: "settings/backup", version: "1" })
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post("run")
  @RequirePermissions(PERMISSIONS.SETTINGS_WRITE)
  run() {
    return this.backupService.runBackup();
  }
}
