import { Injectable } from "@nestjs/common";
import type { FlightFareDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

const SETTING_ID = "default";
/** Sentinel for "applies to the whole route" — an empty string, not null, so the unique DB index stays meaningful. */
const ANY = "";

export interface EffectiveMargin {
  marginPercent: number;
  marginFlat: number;
}

function toRouteDto(r: {
  id: string;
  depCity: string;
  arrCity: string;
  airlineCode: string;
  flightNo: string;
  label: string | null;
  marginPercent: { toNumber(): number };
  marginFlat: { toNumber(): number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id,
    depCity: r.depCity,
    arrCity: r.arrCity,
    airlineCode: r.airlineCode || null,
    flightNo: r.flightNo || null,
    label: r.label,
    marginPercent: r.marginPercent.toNumber(),
    marginFlat: r.marginFlat.toNumber(),
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Applies Paxbook's own margin/discount on top of the FTD provider's fare before it's ever shown
 * to a customer. Global (not per-tenant): the FTD integration itself is a single shared account
 * configured via env vars, not a per-tenant credential, so there's one platform-wide margin, with
 * optional route-wide overrides, with optional flight-specific overrides on top of those — see
 * FlightPricingSetting/FlightRoutePricingRule in schema.prisma. Precedence, most specific wins:
 * exact airline+flight number on a route > the whole route > the global default.
 */
@Injectable()
export class FlightPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSetting(): Promise<{ marginPercent: number; marginFlat: number; updatedAt: Date }> {
    const setting = await this.prisma.flightPricingSetting.findUnique({ where: { id: SETTING_ID } });
    if (setting) return { marginPercent: setting.marginPercent.toNumber(), marginFlat: setting.marginFlat.toNumber(), updatedAt: setting.updatedAt };
    return { marginPercent: 0, marginFlat: 0, updatedAt: new Date(0) };
  }

  async updateSetting(marginPercent: number, marginFlat: number) {
    const setting = await this.prisma.flightPricingSetting.upsert({
      where: { id: SETTING_ID },
      update: { marginPercent, marginFlat },
      create: { id: SETTING_ID, marginPercent, marginFlat },
    });
    return { marginPercent: setting.marginPercent.toNumber(), marginFlat: setting.marginFlat.toNumber(), updatedAt: setting.updatedAt };
  }

  async listRoutes() {
    const routes = await this.prisma.flightRoutePricingRule.findMany({ orderBy: [{ depCity: "asc" }, { flightNo: "asc" }] });
    return routes.map(toRouteDto);
  }

  async createRoute(
    depCity: string,
    arrCity: string,
    marginPercent: number,
    marginFlat: number,
    isActive = true,
    airlineCode?: string,
    flightNo?: string,
    label?: string,
  ) {
    const r = await this.prisma.flightRoutePricingRule.create({
      data: {
        depCity: depCity.toUpperCase(),
        arrCity: arrCity.toUpperCase(),
        airlineCode: airlineCode?.toUpperCase() || ANY,
        flightNo: flightNo || ANY,
        label: label || null,
        marginPercent,
        marginFlat,
        isActive,
      },
    });
    return toRouteDto(r);
  }

  async updateRoute(
    id: string,
    patch: { depCity?: string; arrCity?: string; airlineCode?: string; flightNo?: string; label?: string; marginPercent?: number; marginFlat?: number; isActive?: boolean },
  ) {
    const r = await this.prisma.flightRoutePricingRule.update({
      where: { id },
      data: {
        ...(patch.depCity ? { depCity: patch.depCity.toUpperCase() } : {}),
        ...(patch.arrCity ? { arrCity: patch.arrCity.toUpperCase() } : {}),
        ...(patch.airlineCode !== undefined ? { airlineCode: patch.airlineCode.toUpperCase() || ANY } : {}),
        ...(patch.flightNo !== undefined ? { flightNo: patch.flightNo || ANY } : {}),
        ...(patch.label !== undefined ? { label: patch.label || null } : {}),
        ...(patch.marginPercent !== undefined ? { marginPercent: patch.marginPercent } : {}),
        ...(patch.marginFlat !== undefined ? { marginFlat: patch.marginFlat } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      },
    });
    return toRouteDto(r);
  }

  async deleteRoute(id: string) {
    await this.prisma.flightRoutePricingRule.delete({ where: { id } });
  }

  /** The route actually flown (first leg's departure to the last leg's arrival) and its marketing
   * airline+flight number decide which rule applies — all derived from the mapped response, not the
   * search request, so connecting-flight ODs and specific flight numbers resolve correctly without
   * any extra params from the caller. */
  async getEffectiveMargin(depCity: string, arrCity: string, airlineCode?: string, flightNo?: string): Promise<EffectiveMargin> {
    if (depCity && arrCity) {
      const dep = depCity.toUpperCase();
      const arr = arrCity.toUpperCase();
      if (airlineCode && flightNo) {
        const specific = await this.prisma.flightRoutePricingRule.findUnique({
          where: { depCity_arrCity_airlineCode_flightNo: { depCity: dep, arrCity: arr, airlineCode: airlineCode.toUpperCase(), flightNo } },
        });
        if (specific?.isActive) return { marginPercent: specific.marginPercent.toNumber(), marginFlat: specific.marginFlat.toNumber() };
      }
      const route = await this.prisma.flightRoutePricingRule.findUnique({
        where: { depCity_arrCity_airlineCode_flightNo: { depCity: dep, arrCity: arr, airlineCode: ANY, flightNo: ANY } },
      });
      if (route?.isActive) return { marginPercent: route.marginPercent.toNumber(), marginFlat: route.marginFlat.toNumber() };
    }
    const setting = await this.getSetting();
    return { marginPercent: setting.marginPercent, marginFlat: setting.marginFlat };
  }

  applyMargin(fare: FlightFareDto, margin: EffectiveMargin): FlightFareDto {
    if (margin.marginPercent === 0 && margin.marginFlat === 0) return fare;
    const adjustedTotal = Math.round((fare.total * (1 + margin.marginPercent / 100) + margin.marginFlat) * 100) / 100;
    const delta = Math.round((adjustedTotal - fare.total) * 100) / 100;
    return { ...fare, total: adjustedTotal, base: Math.round((fare.base + delta) * 100) / 100 };
  }
}
