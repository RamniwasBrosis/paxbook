import { Injectable } from "@nestjs/common";
import type { AdminDirectoryEntryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

/** Lightweight picker data for the Lead-consultant and Task-assignee selects — deliberately not a Users duplicate (no status/role/password). */
@Injectable()
export class AdminDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<AdminDirectoryEntryDto[]> {
    return this.prisma.adminUser.findMany({
      where: { tenantId, status: "ACTIVE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }
}
