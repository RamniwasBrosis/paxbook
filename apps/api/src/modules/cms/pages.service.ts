import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type Page } from "@prisma/client";
import type { PageDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { upsertSeoMeta } from "../../common/seo/upsert-seo-meta";
import type { SavePageDto } from "./dto/save-page.dto";

const ENTITY_TYPE = "page";

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<PageDto[]> {
    const pages = await this.prisma.page.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    const seoByEntityId = await this.fetchSeoMap(pages.map((p) => p.id));
    return pages.map((p) => this.toDto(p, seoByEntityId.get(p.id) ?? null));
  }

  async create(tenantId: string, dto: SavePageDto): Promise<PageDto> {
    let created: Page;
    try {
      created = await this.prisma.page.create({
        data: { tenantId, title: dto.title, slug: dto.slug, body: dto.body, status: dto.status ?? "DRAFT" },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }
    await upsertSeoMeta(this.prisma, ENTITY_TYPE, created.id, dto.seo);
    return this.toDto(created, null);
  }

  async update(tenantId: string, id: string, dto: SavePageDto): Promise<PageDto> {
    await this.assertOwned(tenantId, id);
    let updated: Page;
    try {
      updated = await this.prisma.page.update({
        where: { id },
        data: { title: dto.title, slug: dto.slug, body: dto.body, status: dto.status },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }
    await upsertSeoMeta(this.prisma, ENTITY_TYPE, id, dto.seo);
    const seo = await this.prisma.seoMeta.findUnique({ where: { entityType_entityId: { entityType: ENTITY_TYPE, entityId: id } } });
    return this.toDto(updated, seo);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.page.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, id: string): Promise<Page> {
    const page = await this.prisma.page.findFirst({ where: { id, tenantId } });
    if (!page) {
      throw new NotFoundException({ code: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }
    return page;
  }

  private async fetchSeoMap(entityIds: string[]) {
    if (entityIds.length === 0) return new Map();
    const rows = await this.prisma.seoMeta.findMany({ where: { entityType: ENTITY_TYPE, entityId: { in: entityIds } } });
    return new Map(rows.map((row) => [row.entityId, row]));
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code: "PAGE_SLUG_TAKEN", message: "A page with this slug already exists." });
    }
    return err as Error;
  }

  private toDto(
    page: Page,
    seo: { title: string | null; description: string | null; ogImageKey: string | null; canonicalUrl: string | null } | null,
  ): PageDto {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      body: page.body,
      status: page.status,
      seo: seo
        ? {
            title: seo.title,
            description: seo.description,
            ogImageKey: seo.ogImageKey,
            ogImageUrl: this.storageService.buildPublicUrl(seo.ogImageKey),
            canonicalUrl: seo.canonicalUrl,
          }
        : null,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };
  }
}
