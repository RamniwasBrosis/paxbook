import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuditLogEntryDto } from "@paxbook/types";
import type { Prisma } from "@prisma/client";

interface RecordAuditEntryInput {
  tenantId: string;
  actorAdminId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  diffJson?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditEntryInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorAdminId: input.actorAdminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        diffJson: input.diffJson,
        ipAddress: input.ipAddress ?? null,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: AuditLogEntryDto[]; meta: { page: number; pageSize: number; total: number } }> {
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: { actorAdmin: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        actorAdminId: row.actorAdminId,
        actorName: row.actorAdmin?.name ?? null,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        diff: (row.diffJson as Record<string, unknown> | null) ?? null,
        ipAddress: row.ipAddress,
        createdAt: row.createdAt.toISOString(),
      })),
      meta: { page, pageSize, total },
    };
  }
}
