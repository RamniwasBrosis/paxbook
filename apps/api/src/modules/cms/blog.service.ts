import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type BlogPost } from "@prisma/client";
import type { BlogPostDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { upsertSeoMeta } from "../../common/seo/upsert-seo-meta";
import type { SaveBlogPostDto } from "./dto/save-blog-post.dto";

const ENTITY_TYPE = "blog_post";

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<BlogPostDto[]> {
    const posts = await this.prisma.blogPost.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    const seoByEntityId = await this.fetchSeoMap(posts.map((p) => p.id));
    return posts.map((p) => this.toDto(p, seoByEntityId.get(p.id) ?? null));
  }

  async create(tenantId: string, dto: SaveBlogPostDto): Promise<BlogPostDto> {
    let created;
    try {
      created = await this.prisma.blogPost.create({
        data: {
          tenantId,
          title: dto.title,
          slug: dto.slug,
          body: dto.body,
          excerpt: dto.excerpt,
          category: dto.category,
          readMinutes: dto.readMinutes,
          coverImageKey: dto.coverImageKey,
          status: dto.status ?? "DRAFT",
          publishedAt: dto.status === "PUBLISHED" ? new Date() : null,
        },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, created.id, dto.seo);
    if (dto.status === "PUBLISHED") await this.upsertSitemapEntry(dto.slug);
    return this.toDto(created, null);
  }

  async update(tenantId: string, id: string, dto: SaveBlogPostDto): Promise<BlogPostDto> {
    const existing = await this.assertOwned(tenantId, id);
    const wasPublished = existing.status === "PUBLISHED";
    const willBePublished = (dto.status ?? existing.status) === "PUBLISHED";

    let updated;
    try {
      updated = await this.prisma.blogPost.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug,
          body: dto.body,
          excerpt: dto.excerpt,
          category: dto.category,
          readMinutes: dto.readMinutes,
          coverImageKey: dto.coverImageKey,
          status: dto.status ?? existing.status,
          publishedAt: willBePublished ? (wasPublished ? undefined : new Date()) : null,
        },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await upsertSeoMeta(this.prisma, ENTITY_TYPE, id, dto.seo);
    if (willBePublished) {
      await this.upsertSitemapEntry(dto.slug);
    } else if (wasPublished && !willBePublished) {
      await this.removeSitemapEntry(existing.slug);
    }

    const seo = await this.prisma.seoMeta.findUnique({ where: { entityType_entityId: { entityType: ENTITY_TYPE, entityId: id } } });
    return this.toDto(updated, seo);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const existing = await this.assertOwned(tenantId, id);
    await this.prisma.blogPost.delete({ where: { id } });
    if (existing.status === "PUBLISHED") await this.removeSitemapEntry(existing.slug);
  }

  private async assertOwned(tenantId: string, id: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!post) {
      throw new NotFoundException({ code: "BLOG_POST_NOT_FOUND", message: "Blog post does not exist." });
    }
    return post;
  }

  private async fetchSeoMap(entityIds: string[]) {
    if (entityIds.length === 0) return new Map();
    const rows = await this.prisma.seoMeta.findMany({ where: { entityType: ENTITY_TYPE, entityId: { in: entityIds } } });
    return new Map(rows.map((row) => [row.entityId, row]));
  }

  private async upsertSitemapEntry(slug: string): Promise<void> {
    const url = `/blog/${slug}`;
    await this.prisma.sitemapEntry.upsert({
      where: { url },
      update: { lastModified: new Date() },
      create: { url, lastModified: new Date(), priority: 0.5 },
    });
  }

  private async removeSitemapEntry(slug: string): Promise<void> {
    await this.prisma.sitemapEntry.deleteMany({ where: { url: `/blog/${slug}` } });
  }

  private toDto(
    post: BlogPost,
    seo: { title: string | null; description: string | null; ogImageKey: string | null; canonicalUrl: string | null } | null,
  ): BlogPostDto {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      body: post.body,
      excerpt: post.excerpt,
      category: post.category,
      readMinutes: post.readMinutes,
      coverImageKey: post.coverImageKey,
      coverImageUrl: this.storageService.buildPublicUrl(post.coverImageKey),
      status: post.status,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      seo: seo
        ? {
            title: seo.title,
            description: seo.description,
            ogImageKey: seo.ogImageKey,
            ogImageUrl: this.storageService.buildPublicUrl(seo.ogImageKey),
            canonicalUrl: seo.canonicalUrl,
          }
        : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code: "BLOG_SLUG_TAKEN", message: "A blog post with this slug already exists." });
    }
    return err as Error;
  }
}
