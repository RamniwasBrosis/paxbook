import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { TaskDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveTaskDto } from "./dto/save-task.dto";

const INCLUDE = { assignedTo: { select: { name: true } } } satisfies Prisma.TaskInclude;
type Row = Prisma.TaskGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({ where: { tenantId }, include: INCLUDE, orderBy: [{ dueDate: "asc" }, { priority: "desc" }] });
    return tasks.map(toDto);
  }

  async create(tenantId: string, dto: SaveTaskDto): Promise<TaskDto> {
    await this.assertAssigneeBelongsToTenant(tenantId, dto.assignedToId);
    const created = await this.prisma.task.create({
      data: {
        tenantId,
        assignedToId: dto.assignedToId,
        title: dto.title,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status ?? "OPEN",
        priority: dto.priority ?? "MEDIUM",
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
      },
      include: INCLUDE,
    });
    return toDto(created);
  }

  async update(tenantId: string, id: string, dto: SaveTaskDto): Promise<TaskDto> {
    await this.getOwned(tenantId, id);
    await this.assertAssigneeBelongsToTenant(tenantId, dto.assignedToId);
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId,
        title: dto.title,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        priority: dto.priority,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
      },
      include: INCLUDE,
    });
    return toDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async getOwned(tenantId: string, id: string): Promise<void> {
    const count = await this.prisma.task.count({ where: { id, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "TASK_NOT_FOUND", message: "Task does not exist." });
    }
  }

  private async assertAssigneeBelongsToTenant(tenantId: string, assignedToId: string): Promise<void> {
    const count = await this.prisma.adminUser.count({ where: { id: assignedToId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "ADMIN_NOT_FOUND", message: "Selected admin user does not exist." });
    }
  }
}

function toDto(task: Row): TaskDto {
  return {
    id: task.id,
    assignedToId: task.assignedToId,
    assignedToName: task.assignedTo.name,
    title: task.title,
    dueDate: task.dueDate?.toISOString() ?? null,
    status: task.status,
    priority: task.priority,
    relatedEntityType: task.relatedEntityType,
    relatedEntityId: task.relatedEntityId,
  };
}
