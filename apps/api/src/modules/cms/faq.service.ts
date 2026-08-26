import { Injectable, NotFoundException } from "@nestjs/common";
import type { FaqItemDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveFaqItemDto } from "./dto/save-faq-item.dto";

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly SELECT = {
    id: true,
    entityType: true,
    entityId: true,
    question: true,
    answer: true,
    sortOrder: true,
  } satisfies Record<keyof FaqItemDto, true>;

  async findAll(tenantId: string): Promise<FaqItemDto[]> {
    return this.prisma.faqItem.findMany({
      where: { tenantId },
      orderBy: { sortOrder: "asc" },
      select: FaqService.SELECT,
    });
  }

  async create(tenantId: string, dto: SaveFaqItemDto): Promise<FaqItemDto> {
    return this.prisma.faqItem.create({
      data: {
        tenantId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
      },
      select: FaqService.SELECT,
    });
  }

  async update(tenantId: string, id: string, dto: SaveFaqItemDto): Promise<FaqItemDto> {
    await this.assertOwned(tenantId, id);
    return this.prisma.faqItem.update({
      where: { id },
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder,
      },
      select: FaqService.SELECT,
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.faqItem.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, id: string): Promise<void> {
    const item = await this.prisma.faqItem.findFirst({ where: { id, tenantId } });
    if (!item) {
      throw new NotFoundException({ code: "FAQ_ITEM_NOT_FOUND", message: "FAQ item does not exist." });
    }
  }
}
