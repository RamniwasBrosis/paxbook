import { Injectable, NotFoundException } from "@nestjs/common";
import type { ReviewDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveReviewDto } from "./dto/save-review.dto";
import type { ModerateReviewDto } from "./dto/moderate-review.dto";

const REVIEW_INCLUDE = { package: { select: { title: true } } };

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { tenantId },
      include: REVIEW_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return reviews.map(toReviewDto);
  }

  async create(tenantId: string, dto: SaveReviewDto): Promise<ReviewDto> {
    const created = await this.prisma.review.create({
      data: {
        tenantId,
        packageId: dto.packageId,
        authorName: dto.authorName,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        status: dto.status ?? "PENDING",
      },
      include: REVIEW_INCLUDE,
    });
    return toReviewDto(created);
  }

  async moderate(tenantId: string, id: string, dto: ModerateReviewDto): Promise<ReviewDto> {
    await this.assertOwned(tenantId, id);
    const updated = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: REVIEW_INCLUDE,
    });
    return toReviewDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.review.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, id: string): Promise<void> {
    const review = await this.prisma.review.findFirst({ where: { id, tenantId } });
    if (!review) {
      throw new NotFoundException({ code: "REVIEW_NOT_FOUND", message: "Review does not exist." });
    }
  }
}

function toReviewDto(review: {
  id: string;
  packageId: string;
  package: { title: string };
  customerId: string | null;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
}): ReviewDto {
  return {
    id: review.id,
    packageId: review.packageId,
    packageTitle: review.package.title,
    customerId: review.customerId,
    authorName: review.authorName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
  };
}
