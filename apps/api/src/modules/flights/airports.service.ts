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

  /** Active airports' cities matching `q` (city, airport name or code), one row per city, at most 8. */
  async searchCities(q: string): Promise<{ city: string; country: string; code: string }[]> {
    const term = q.trim().slice(0, 40);
    const airports = await this.prisma.airport.findMany({
      where: {
        isActive: true,
        ...(term
          ? { OR: [{ city: { contains: term, mode: "insensitive" } }, { name: { contains: term, mode: "insensitive" } }, { code: { equals: term.toUpperCase() } }] }
          : {}),
      },
      orderBy: [{ city: "asc" }, { code: "asc" }],
      take: 40,
    });
    const seen = new Set<string>();
    const lower = term.toLowerCase();
    return airports
      .filter((a) => (seen.has(a.city) ? false : (seen.add(a.city), true)))
      // Cities that start with what was typed come first ("Del" -> Delhi before Adelaide).
      .sort((a, b) => Number(!a.city.toLowerCase().startsWith(lower)) - Number(!b.city.toLowerCase().startsWith(lower)))
      .slice(0, 8)
      .map((a) => ({ city: a.city, country: a.country, code: a.code }));
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
