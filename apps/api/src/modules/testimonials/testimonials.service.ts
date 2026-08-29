import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { TestimonialDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CacheService } from "../../common/cache/cache.service";
import type { SaveTestimonialDto } from "./dto/save-testimonial.dto";

const TESTIMONIAL_INCLUDE = {
  destination: true,
  package: { select: { id: true, title: true } },
} satisfies Prisma.TestimonialInclude;

type TestimonialRow = Prisma.TestimonialGetPayload<{ include: typeof TESTIMONIAL_INCLUDE }>;

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cache: CacheService,
  ) {}

  async findAll(tenantId: string): Promise<TestimonialDto[]> {
    const testimonials = await this.prisma.testimonial.findMany({
      where: { tenantId, deletedAt: null },
      include: TESTIMONIAL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return testimonials.map((t) => this.toDto(t));
  }

  async findOne(tenantId: string, id: string): Promise<TestimonialDto> {
    const testimonial = await this.getOwned(tenantId, id);
    return this.toDto(testimonial);
  }

  async create(tenantId: string, dto: SaveTestimonialDto, canApprove: boolean): Promise<TestimonialDto> {
    if (dto.status === "PUBLISHED" && !canApprove) {
      throw new ForbiddenException({ code: "APPROVAL_REQUIRED", message: "Only a Super Admin can publish a testimonial." });
    }

    let created: { id: string };
    try {
      created = await this.prisma.testimonial.create({
        data: {
          tenantId,
          customerName: dto.customerName,
          rating: dto.rating,
          content: dto.content,
          imageKey: dto.imageKey,
          isFeatured: dto.isFeatured ?? false,
          slug: dto.slug,
          title: dto.title,
          tripTitle: dto.tripTitle,
          destinationId: dto.destinationId,
          packageId: dto.packageId,
          videoKey: dto.videoKey,
          posterKey: dto.posterKey,
          durationSeconds: dto.durationSeconds,
          testimonialDate: dto.testimonialDate ? new Date(dto.testimonialDate) : undefined,
          sortOrder: dto.sortOrder ?? 0,
          status: dto.status ?? "DRAFT",
          publishedAt: dto.status === "PUBLISHED" ? new Date() : null,
        },
        select: { id: true },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await this.cache.invalidate(`public:homepage:${tenantId}`);
    return this.findOne(tenantId, created.id);
  }

  async update(tenantId: string, id: string, dto: SaveTestimonialDto, canApprove: boolean): Promise<TestimonialDto> {
    const existing = await this.getOwned(tenantId, id);
    const wasPublished = existing.status === "PUBLISHED";
    const willBePublished = (dto.status ?? existing.status) === "PUBLISHED";

    if (willBePublished !== wasPublished && !canApprove) {
      throw new ForbiddenException({ code: "APPROVAL_REQUIRED", message: "Only a Super Admin can publish or unpublish a testimonial." });
    }

    try {
      await this.prisma.testimonial.update({
        where: { id },
        data: {
          customerName: dto.customerName,
          rating: dto.rating,
          content: dto.content,
          imageKey: dto.imageKey,
          isFeatured: dto.isFeatured ?? false,
          slug: dto.slug,
          title: dto.title,
          tripTitle: dto.tripTitle,
          destinationId: dto.destinationId ?? null,
          packageId: dto.packageId ?? null,
          videoKey: dto.videoKey,
          posterKey: dto.posterKey,
          durationSeconds: dto.durationSeconds,
          testimonialDate: dto.testimonialDate ? new Date(dto.testimonialDate) : undefined,
          sortOrder: dto.sortOrder ?? existing.sortOrder,
          status: dto.status ?? existing.status,
          publishedAt: willBePublished ? (wasPublished ? undefined : new Date()) : null,
        },
      });
    } catch (err) {
      throw this.mapWriteError(err);
    }

    await this.cache.invalidate(`public:homepage:${tenantId}`);
    return this.findOne(tenantId, id);
  }

  async setPublished(tenantId: string, id: string, published: boolean): Promise<TestimonialDto> {
    await this.getOwned(tenantId, id);
    await this.prisma.testimonial.update({
      where: { id },
      data: {
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
      },
    });
    await this.cache.invalidate(`public:homepage:${tenantId}`);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.cache.invalidate(`public:homepage:${tenantId}`);
  }

  private async getOwned(tenantId: string, id: string): Promise<TestimonialRow> {
    const testimonial = await this.prisma.testimonial.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: TESTIMONIAL_INCLUDE,
    });
    if (!testimonial) {
      throw new NotFoundException({ code: "TESTIMONIAL_NOT_FOUND", message: "Testimonial does not exist." });
    }
    return testimonial;
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({
        code: "TESTIMONIAL_SLUG_TAKEN",
        message: "A testimonial with this slug already exists.",
      });
    }
    return err as Error;
  }

  private toDto(t: TestimonialRow): TestimonialDto {
    return {
      id: t.id,
      customerName: t.customerName,
      rating: t.rating,
      content: t.content,
      imageKey: t.imageKey,
      imageUrl: this.storageService.buildPublicUrl(t.imageKey),
      isFeatured: t.isFeatured,
      slug: t.slug,
      title: t.title,
      tripTitle: t.tripTitle,
      destinationId: t.destinationId,
      destinationName: t.destination?.name ?? null,
      packageId: t.packageId,
      packageTitle: t.package?.title ?? null,
      videoKey: t.videoKey,
      videoUrl: this.storageService.buildPublicUrl(t.videoKey),
      posterKey: t.posterKey,
      posterUrl: this.storageService.buildPublicUrl(t.posterKey),
      durationSeconds: t.durationSeconds,
      testimonialDate: t.testimonialDate?.toISOString() ?? null,
      sortOrder: t.sortOrder,
      status: t.status,
      publishedAt: t.publishedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}
