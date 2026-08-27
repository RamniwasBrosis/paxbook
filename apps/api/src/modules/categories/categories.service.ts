import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CategoryDto, SaveCategoryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryDto[]> {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async create(dto: SaveCategoryDto): Promise<CategoryDto> {
    try {
      return await this.prisma.category.create({ data: { name: dto.name } });
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async update(id: string, dto: SaveCategoryDto): Promise<CategoryDto> {
    await this.getOwned(id);
    try {
      return await this.prisma.category.update({ where: { id }, data: { name: dto.name } });
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async remove(id: string): Promise<void> {
    await this.getOwned(id);

    const [destinationUses, packageUses, vendorUses] = await Promise.all([
      this.prisma.destinationCategoryMap.count({ where: { categoryId: id } }),
      this.prisma.packageCategoryMap.count({ where: { categoryId: id } }),
      this.prisma.vendorCategoryMap.count({ where: { categoryId: id } }),
    ]);

    if (destinationUses + packageUses + vendorUses > 0) {
      throw new ConflictException({
        code: "CATEGORY_IN_USE",
        message: "This category is assigned to destinations, packages, or vendors — remove those tags first.",
      });
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private async getOwned(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException({ code: "CATEGORY_NOT_FOUND", message: "Category does not exist." });
    }
    return category;
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code: "CATEGORY_NAME_TAKEN", message: "A category with this name already exists." });
    }
    return err as Error;
  }
}
