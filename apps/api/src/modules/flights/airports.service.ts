import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { AirportDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

function toDto(a: { id: string; code: string; name: string; city: string; country: string; isActive: boolean; createdAt: Date; updatedAt: Date }): AirportDto {
  return { id: a.id, code: a.code, name: a.name, city: a.city, country: a.country, isActive: a.isActive, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() };
}

/** Global reference data (see schema.prisma) driving the customer-facing airport search autocomplete. */
@Injectable()
export class AirportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Active airports only, for the public autocomplete — small enough to fetch in full and filter client-side. */
  async listActive(): Promise<AirportDto[]> {
    const airports = await this.prisma.airport.findMany({ where: { isActive: true }, orderBy: { city: "asc" } });
    return airports.map(toDto);
  }

  async listAll(): Promise<AirportDto[]> {
    const airports = await this.prisma.airport.findMany({ orderBy: { city: "asc" } });
    return airports.map(toDto);
  }

  async create(data: { code: string; name: string; city: string; country: string; isActive?: boolean }): Promise<AirportDto> {
    const existing = await this.prisma.airport.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) throw new ConflictException({ code: "AIRPORT_CODE_EXISTS", message: `An airport with code ${data.code.toUpperCase()} already exists.` });
    const airport = await this.prisma.airport.create({ data: { ...data, code: data.code.toUpperCase() } });
    return toDto(airport);
  }

  async update(id: string, data: Partial<{ code: string; name: string; city: string; country: string; isActive: boolean }>): Promise<AirportDto> {
    const airport = await this.prisma.airport
      .update({ where: { id }, data: { ...data, ...(data.code ? { code: data.code.toUpperCase() } : {}) } })
      .catch(() => null);
    if (!airport) throw new NotFoundException({ code: "AIRPORT_NOT_FOUND", message: "Airport does not exist." });
    return toDto(airport);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.airport.delete({ where: { id } }).catch(() => {
      throw new NotFoundException({ code: "AIRPORT_NOT_FOUND", message: "Airport does not exist." });
    });
  }
}
