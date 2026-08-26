import { Injectable, NotFoundException } from "@nestjs/common";
import type { NotificationDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CustomerNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, customerId: string): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({ where: { tenantId, customerId }, orderBy: { createdAt: "desc" } });
    return notifications.map(toDto);
  }

  async markRead(tenantId: string, customerId: string, id: string): Promise<NotificationDto> {
    const existing = await this.prisma.notification.findFirst({ where: { id, tenantId, customerId } });
    if (!existing) {
      throw new NotFoundException({ code: "NOTIFICATION_NOT_FOUND", message: "Notification does not exist." });
    }
    const updated = await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    return toDto(updated);
  }

  /** Called from other customer-portal services at the moments that matter — payment captured, booking confirmed, cancellation resolved. */
  async create(tenantId: string, customerId: string, type: string, title: string, body: string): Promise<void> {
    await this.prisma.notification.create({ data: { tenantId, customerId, type, title, body } });
  }
}

function toDto(n: { id: string; type: string; title: string; body: string; isRead: boolean; createdAt: Date }): NotificationDto {
  return { id: n.id, type: n.type, title: n.title, body: n.body, isRead: n.isRead, createdAt: n.createdAt.toISOString() };
}
