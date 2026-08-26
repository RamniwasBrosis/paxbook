import { Injectable, NotFoundException } from "@nestjs/common";
import type { HomepageBlockDto } from "@paxbook/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveHomepageBlockDto } from "./dto/save-homepage-block.dto";

@Injectable()
export class HomepageBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<HomepageBlockDto[]> {
    const blocks = await this.prisma.homepageBlock.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } });
    return blocks.map((b) => ({ id: b.id, type: b.type, configJson: b.configJson as Record<string, unknown>, sortOrder: b.sortOrder }));
  }

  async create(tenantId: string, dto: SaveHomepageBlockDto): Promise<HomepageBlockDto> {
    const created = await this.prisma.homepageBlock.create({
      data: {
        tenantId,
        type: dto.type,
        configJson: dto.configJson as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return { id: created.id, type: created.type, configJson: created.configJson as Record<string, unknown>, sortOrder: created.sortOrder };
  }

  async update(tenantId: string, id: string, dto: SaveHomepageBlockDto): Promise<HomepageBlockDto> {
    await this.assertOwned(tenantId, id);
    const updated = await this.prisma.homepageBlock.update({
      where: { id },
      data: {
        type: dto.type,
        configJson: dto.configJson as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder,
      },
    });
    return { id: updated.id, type: updated.type, configJson: updated.configJson as Record<string, unknown>, sortOrder: updated.sortOrder };
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.homepageBlock.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, id: string): Promise<void> {
    const block = await this.prisma.homepageBlock.findFirst({ where: { id, tenantId } });
    if (!block) {
      throw new NotFoundException({ code: "HOMEPAGE_BLOCK_NOT_FOUND", message: "Homepage block does not exist." });
    }
  }
}
