import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ReviewDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SubmitReviewDto } from "./dto/submit-review.dto";

const INCLUDE = { package: { select: { title: true } } } satisfies Prisma.ReviewInclude;
type Row = Prisma.ReviewGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class CustomerReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(tenantId: string, customerId: string, customerName: string, dto: SubmitReviewDto): Promise<ReviewDto> {
    const pkg = await this.prisma.package.count({ where: { id: dto.packageId, tenantId, deletedAt: null } });
    if (!pkg) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Package does not exist." });
    }
    const created = await this.prisma.review.create({
      data: {
        tenantId,
        packageId: dto.packageId,
        customerId,
        authorName: customerName,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        status: "PENDING",
      },
      include: INCLUDE,
    });
    return toDto(created);
  }

  async listMine(tenantId: string, customerId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({ where: { tenantId, customerId }, include: INCLUDE, orderBy: { createdAt: "desc" } });
    return reviews.map(toDto);
  }
}

function toDto(r: Row): ReviewDto {
  return {
    id: r.id,
    packageId: r.packageId,
    packageTitle: r.package.title,
    customerId: r.customerId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}
