import { Module } from "@nestjs/common";
import { CrmModule } from "../crm/crm.module";
import { PublicContentController } from "./public-content.controller";
import { PublicLeadsController } from "./public-leads.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [CrmModule],
  controllers: [PublicContentController, PublicLeadsController],
  providers: [PublicService],
})
export class PublicModule {}
