import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { PublicService } from "./public.service";

@ApiTags("public")
@Public()
@Controller({ path: "public", version: "1" })
export class PublicContentController {
  constructor(private readonly publicService: PublicService) {}

  @Get("homepage")
  getHomepage(@CurrentTenant() tenant: ResolvedTenant) {
    return this.publicService.getHomepage(tenant.id);
  }

  @Get("branding")
  getBranding(@CurrentTenant() tenant: ResolvedTenant) {
    return this.publicService.getBranding(tenant.id);
  }

  @Get("stats")
  getStats(@CurrentTenant() tenant: ResolvedTenant) {
    return this.publicService.getStats(tenant.id);
  }

  @Get("destinations")
  listDestinations(
    @CurrentTenant() tenant: ResolvedTenant,
    @Query("category") category?: string,
    @Query("region") region?: string,
    @Query("search") search?: string,
  ) {
    return this.publicService.listDestinations(tenant.id, category, region, search);
  }

  @Get("destinations/:slug")
  getDestination(@CurrentTenant() tenant: ResolvedTenant, @Param("slug") slug: string) {
    return this.publicService.getDestinationBySlug(tenant.id, slug);
  }

  @Get("packages")
  listPackages(
    @CurrentTenant() tenant: ResolvedTenant,
    @Query("destination") destination?: string,
    @Query("category") category?: string,
    @Query("minDuration") minDuration?: string,
    @Query("maxDuration") maxDuration?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
  ) {
    return this.publicService.listPackages(tenant.id, {
      destination,
      category,
      minDuration: minDuration ? Number(minDuration) : undefined,
      maxDuration: maxDuration ? Number(maxDuration) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Get("packages/:slug")
  getPackage(@CurrentTenant() tenant: ResolvedTenant, @Param("slug") slug: string) {
    return this.publicService.getPackageBySlug(tenant.id, slug);
  }

  @Get("blog")
  listBlog(@CurrentTenant() tenant: ResolvedTenant, @Query("category") category?: string, @Query("search") search?: string) {
    return this.publicService.listBlogPosts(tenant.id, category, search);
  }

  @Get("blog/:slug")
  getBlogPost(@CurrentTenant() tenant: ResolvedTenant, @Param("slug") slug: string) {
    return this.publicService.getBlogPostBySlug(tenant.id, slug);
  }

  @Get("videos/:slug")
  getTestimonial(@CurrentTenant() tenant: ResolvedTenant, @Param("slug") slug: string) {
    return this.publicService.getTestimonialBySlug(tenant.id, slug);
  }

  @Get("pages")
  listPages(@CurrentTenant() tenant: ResolvedTenant) {
    return this.publicService.listPages(tenant.id);
  }

  @Get("pages/:slug")
  getPage(@CurrentTenant() tenant: ResolvedTenant, @Param("slug") slug: string) {
    return this.publicService.getPageBySlug(tenant.id, slug);
  }

  @Get("visa-guide")
  listVisaGuide() {
    return this.publicService.listVisaGuide();
  }

  @Get("sitemap")
  listSitemap() {
    return this.publicService.listSitemapEntries();
  }
}
