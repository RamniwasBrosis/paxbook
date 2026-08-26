import { Module } from "@nestjs/common";
import { AdminDirectoryController } from "./admin-directory.controller";
import { AdminDirectoryService } from "./admin-directory.service";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { LeadFollowUpsController } from "./lead-follow-ups.controller";
import { LeadFollowUpsService } from "./lead-follow-ups.service";
import { ConsultantsController } from "./consultants.controller";
import { ConsultantsService } from "./consultants.service";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  controllers: [
    AdminDirectoryController,
    LeadsController,
    LeadFollowUpsController,
    ConsultantsController,
    TasksController,
  ],
  providers: [AdminDirectoryService, LeadsService, LeadFollowUpsService, ConsultantsService, TasksService],
  exports: [LeadsService, LeadFollowUpsService],
})
export class CrmModule {}
