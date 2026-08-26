import { Injectable } from "@nestjs/common";
import type { VendorAssignmentDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class VendorAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, vendorId: string): Promise<VendorAssignmentDto[]> {
    const [hotelAssignments, activityAssignments] = await Promise.all([
      this.prisma.packageHotel.findMany({
        where: { hotelVendorId: vendorId, package: { tenantId, deletedAt: null } },
        include: { package: { include: { destination: true } } },
      }),
      this.prisma.packageActivity.findMany({
        where: { activityVendorId: vendorId, itineraryDay: { package: { tenantId, deletedAt: null } } },
        include: { itineraryDay: { include: { package: { include: { destination: true } } } } },
      }),
    ]);

    const hotelRows: VendorAssignmentDto[] = hotelAssignments.map((h) => ({
      type: "HOTEL",
      packageId: h.package.id,
      packageTitle: h.package.title,
      packageSlug: h.package.slug,
      destinationName: h.package.destination.name,
      detail: `${h.cityName} · ${h.roomType ?? "Standard room"} · Day ${h.checkInDay}-${h.checkOutDay}`,
    }));

    const activityRows: VendorAssignmentDto[] = activityAssignments.map((a) => ({
      type: "ACTIVITY",
      packageId: a.itineraryDay.package.id,
      packageTitle: a.itineraryDay.package.title,
      packageSlug: a.itineraryDay.package.slug,
      destinationName: a.itineraryDay.package.destination.name,
      detail: `${a.name} · Day ${a.itineraryDay.dayNumber}`,
    }));

    return [...hotelRows, ...activityRows];
  }
}
