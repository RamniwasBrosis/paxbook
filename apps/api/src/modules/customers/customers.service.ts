import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CustomerDetailDto, CustomerDocumentDto, CustomerSummaryDto, TravelerDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { SaveCustomerDto } from "./dto/save-customer.dto";
import type { SaveTravelerDto } from "./dto/save-traveler.dto";
import type { SaveCustomerDocumentDto } from "./dto/save-customer-document.dto";

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<CustomerSummaryDto[]> {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      include: { _count: { select: { travelerProfiles: true, bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      travelerCount: c._count.travelerProfiles,
      bookingCount: c._count.bookings,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async findOne(tenantId: string, id: string): Promise<CustomerDetailDto> {
    const customer = await this.getOwned(tenantId, id, {
      travelerProfiles: true,
      documents: true,
      _count: { select: { travelerProfiles: true, bookings: true } },
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      travelerCount: customer._count.travelerProfiles,
      bookingCount: customer._count.bookings,
      createdAt: customer.createdAt.toISOString(),
      travelers: customer.travelerProfiles.map(toTravelerDto),
      documents: customer.documents.map((d) => this.toDocumentDto(d)),
    };
  }

  async create(tenantId: string, dto: SaveCustomerDto): Promise<CustomerSummaryDto> {
    try {
      const created = await this.prisma.customer.create({
        data: { tenantId, name: dto.name, email: dto.email, phone: dto.phone },
      });
      return { id: created.id, name: created.name, email: created.email, phone: created.phone, travelerCount: 0, bookingCount: 0, createdAt: created.createdAt.toISOString() };
    } catch (err) {
      throw this.mapWriteError(err, "CUSTOMER_EMAIL_TAKEN", "A customer with this email already exists.");
    }
  }

  async update(tenantId: string, id: string, dto: SaveCustomerDto): Promise<CustomerSummaryDto> {
    await this.getOwned(tenantId, id, {});
    try {
      const updated = await this.prisma.customer.update({
        where: { id },
        data: { name: dto.name, email: dto.email, phone: dto.phone },
        include: { _count: { select: { travelerProfiles: true, bookings: true } } },
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        travelerCount: updated._count.travelerProfiles,
        bookingCount: updated._count.bookings,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      throw this.mapWriteError(err, "CUSTOMER_EMAIL_TAKEN", "A customer with this email already exists.");
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id, {});
    try {
      await this.prisma.customer.delete({ where: { id } });
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  async addTraveler(tenantId: string, customerId: string, dto: SaveTravelerDto): Promise<TravelerDto> {
    await this.getOwned(tenantId, customerId, {});
    const created = await this.prisma.traveler.create({
      data: {
        customerId,
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        passportNumber: dto.passportNumber,
        nationality: dto.nationality,
      },
    });
    return toTravelerDto(created);
  }

  async updateTraveler(tenantId: string, customerId: string, travelerId: string, dto: SaveTravelerDto): Promise<TravelerDto> {
    await this.getOwnedTraveler(tenantId, customerId, travelerId);
    const updated = await this.prisma.traveler.update({
      where: { id: travelerId },
      data: {
        name: dto.name,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        passportNumber: dto.passportNumber,
        nationality: dto.nationality,
      },
    });
    return toTravelerDto(updated);
  }

  async removeTraveler(tenantId: string, customerId: string, travelerId: string): Promise<void> {
    await this.getOwnedTraveler(tenantId, customerId, travelerId);
    try {
      await this.prisma.traveler.delete({ where: { id: travelerId } });
    } catch (err) {
      throw this.mapDeleteError(err);
    }
  }

  async addDocument(tenantId: string, customerId: string, dto: SaveCustomerDocumentDto): Promise<CustomerDocumentDto> {
    await this.getOwned(tenantId, customerId, {});
    if (dto.travelerId) {
      await this.getOwnedTraveler(tenantId, customerId, dto.travelerId);
    }
    const created = await this.prisma.customerDocument.create({
      data: { customerId, travelerId: dto.travelerId, docType: dto.docType, storageKey: dto.storageKey },
    });
    return this.toDocumentDto(created);
  }

  async removeDocument(tenantId: string, customerId: string, documentId: string): Promise<void> {
    await this.getOwned(tenantId, customerId, {});
    const document = await this.prisma.customerDocument.findFirst({ where: { id: documentId, customerId } });
    if (!document) {
      throw new NotFoundException({ code: "DOCUMENT_NOT_FOUND", message: "Document does not exist." });
    }
    await this.prisma.customerDocument.delete({ where: { id: documentId } });
  }

  private async getOwned<T extends Prisma.CustomerInclude>(tenantId: string, id: string, include: T) {
    const customer = await this.prisma.customer.findFirst({ where: { id, tenantId }, include });
    if (!customer) {
      throw new NotFoundException({ code: "CUSTOMER_NOT_FOUND", message: "Customer does not exist." });
    }
    return customer as Prisma.CustomerGetPayload<{ include: T }>;
  }

  private async getOwnedTraveler(tenantId: string, customerId: string, travelerId: string) {
    await this.getOwned(tenantId, customerId, {});
    const traveler = await this.prisma.traveler.findFirst({ where: { id: travelerId, customerId } });
    if (!traveler) {
      throw new NotFoundException({ code: "TRAVELER_NOT_FOUND", message: "Traveler does not exist." });
    }
    return traveler;
  }

  private toDocumentDto(doc: {
    id: string;
    travelerId: string | null;
    docType: string;
    storageKey: string;
    verifiedAt: Date | null;
    createdAt: Date;
  }): CustomerDocumentDto {
    return {
      id: doc.id,
      travelerId: doc.travelerId,
      docType: doc.docType,
      storageKey: doc.storageKey,
      fileUrl: this.storageService.buildPublicUrl(doc.storageKey) ?? "",
      verifiedAt: doc.verifiedAt?.toISOString() ?? null,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private mapWriteError(err: unknown, code: string, message: string): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code, message });
    }
    return err as Error;
  }

  private mapDeleteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return new ConflictException({
        code: "CUSTOMER_HAS_RELATED_RECORDS",
        message: "This record has related bookings or documents and can't be deleted.",
      });
    }
    return err as Error;
  }
}

function toTravelerDto(traveler: { id: string; name: string; dob: Date | null; passportNumber: string | null; nationality: string | null }): TravelerDto {
  return {
    id: traveler.id,
    name: traveler.name,
    dob: traveler.dob?.toISOString() ?? null,
    passportNumber: traveler.passportNumber,
    nationality: traveler.nationality,
  };
}
