import { Module } from "@nestjs/common";
import { BannersController } from "./banners.controller";
import { BannersService } from "./banners.service";
import { FaqController } from "./faq.controller";
import { FaqService } from "./faq.service";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { HomepageBlocksController } from "./homepage-blocks.controller";
import { HomepageBlocksService } from "./homepage-blocks.service";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";
import { VisaInfoController } from "./visa-info.controller";
import { VisaInfoService } from "./visa-info.service";

@Module({
  controllers: [
    BannersController,
    FaqController,
    BlogController,
    HomepageBlocksController,
    PagesController,
    VisaInfoController,
  ],
  providers: [
    BannersService,
    FaqService,
    BlogService,
    HomepageBlocksService,
    PagesService,
    VisaInfoService,
  ],
})
export class CmsModule {}
