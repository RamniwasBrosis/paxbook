import { Injectable } from "@nestjs/common";
import type { FlightFareDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

const SETTING_ID = "default";
/** Sentinel for "applies to everything on this dimension" — an empty string, not null, so the unique DB index stays meaningful. */
const ANY = "";

export type MarginType = "PERCENT" | "FLAT";

export interface EffectiveMargin {
  marginPercent: number;
  marginFlat: number;
  marginType: MarginType;
}

function toRouteDto(r: {
  id: string;
  depCity: string;
  arrCity: string;
  airlineCode: string;
  flightNo: string;
  cabin: string;
  label: string | null;
  marginPercent: { toNumber(): number };
  marginFlat: { toNumber(): number };
  marginType: string;
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
    cabin: r.cabin || null,
    label: r.label,
    marginPercent: r.marginPercent.toNumber(),
    marginFlat: r.marginFlat.toNumber(),
    marginType: (r.marginType as MarginType) ?? "PERCENT",
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Applies Paxbook's own margin/discount on top of the FTD provider's fare before it's ever shown
 * to a customer. Global (not per-tenant): the FTD integration itself is a single shared account
 * configured via env vars, not a per-tenant credential, so there's one platform-wide margin, with
 * optional route-wide overrides, with optional flight-specific overrides on top of those, each of
 * which can additionally be scoped to one cabin (e.g. a higher margin on Business fares platform-wide,
 * or on Business fares for one specific route) — see FlightPricingSetting/FlightRoutePricingRule in
 * schema.prisma. Precedence, most specific wins: exact flight + exact cabin > exact flight (any cabin)
 * > route + exact cabin > route (any cabin) > the global default.
 */
@Injectable()
export class FlightPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSetting(): Promise<{ marginPercent: number; marginFlat: number; marginType: MarginType; updatedAt: Date }> {
    const setting = await this.prisma.flightPricingSetting.findUnique({ where: { id: SETTING_ID } });
    if (setting)
      return {
        marginPercent: setting.marginPercent.toNumber(),
        marginFlat: setting.marginFlat.toNumber(),
        marginType: (setting.marginType as MarginType) ?? "PERCENT",
        updatedAt: setting.updatedAt,
      };
    return { marginPercent: 0, marginFlat: 0, marginType: "PERCENT", updatedAt: new Date(0) };
  }

  /** Only one of marginPercent/marginFlat is ever actually applied (see EffectiveMargin) — the
   * unused number is still stored so switching the radio back doesn't lose what was there before. */
  async updateSetting(marginPercent: number, marginFlat: number, marginType: MarginType) {
    const setting = await this.prisma.flightPricingSetting.upsert({
      where: { id: SETTING_ID },
      update: { marginPercent, marginFlat, marginType },
      create: { id: SETTING_ID, marginPercent, marginFlat, marginType },
    });
    return {
      marginPercent: setting.marginPercent.toNumber(),
      marginFlat: setting.marginFlat.toNumber(),
      marginType: setting.marginType as MarginType,
      updatedAt: setting.updatedAt,
    };
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
    marginType: MarginType,
    isActive = true,
    airlineCode?: string,
    flightNo?: string,
    label?: string,
    cabin?: string,
  ) {
    const r = await this.prisma.flightRoutePricingRule.create({
      data: {
        depCity: depCity.toUpperCase(),
        arrCity: arrCity.toUpperCase(),
        airlineCode: airlineCode?.toUpperCase() || ANY,
        flightNo: flightNo || ANY,
        cabin: cabin?.toUpperCase() || ANY,
        label: label || null,
        marginPercent,
        marginFlat,
        marginType,
        isActive,
      },
    });
    return toRouteDto(r);
  }

  async updateRoute(
    id: string,
    patch: {
      depCity?: string;
      arrCity?: string;
      airlineCode?: string;
      flightNo?: string;
      cabin?: string;
      label?: string;
      marginPercent?: number;
      marginFlat?: number;
      marginType?: MarginType;
      isActive?: boolean;
    },
  ) {
    const r = await this.prisma.flightRoutePricingRule.update({
      where: { id },
      data: {
        ...(patch.depCity ? { depCity: patch.depCity.toUpperCase() } : {}),
        ...(patch.arrCity ? { arrCity: patch.arrCity.toUpperCase() } : {}),
        ...(patch.airlineCode !== undefined ? { airlineCode: patch.airlineCode.toUpperCase() || ANY } : {}),
        ...(patch.flightNo !== undefined ? { flightNo: patch.flightNo || ANY } : {}),
        ...(patch.cabin !== undefined ? { cabin: patch.cabin.toUpperCase() || ANY } : {}),
        ...(patch.label !== undefined ? { label: patch.label || null } : {}),
        ...(patch.marginPercent !== undefined ? { marginPercent: patch.marginPercent } : {}),
        ...(patch.marginFlat !== undefined ? { marginFlat: patch.marginFlat } : {}),
        ...(patch.marginType !== undefined ? { marginType: patch.marginType } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      },
    });
    return toRouteDto(r);
  }

  async deleteRoute(id: string) {
    await this.prisma.flightRoutePricingRule.delete({ where: { id } });
  }

  /** The route actually flown (first leg's departure to the last leg's arrival), its marketing
   * airline+flight number, and its cabin all decide which rule applies — all derived from the mapped
   * response, not the search request, so connecting-flight ODs resolve correctly without any extra
   * params from the caller. */
  async getEffectiveMargin(depCity: string, arrCity: string, airlineCode?: string, flightNo?: string, cabin?: string): Promise<EffectiveMargin> {
    if (depCity && arrCity) {
      const dep = depCity.toUpperCase();
      const arr = arrCity.toUpperCase();
      const cab = cabin?.toUpperCase() || ANY;

      const lookup = async (air: string, flt: string, cb: string) => {
        const rule = await this.prisma.flightRoutePricingRule.findUnique({
          where: { depCity_arrCity_airlineCode_flightNo_cabin: { depCity: dep, arrCity: arr, airlineCode: air, flightNo: flt, cabin: cb } },
        });
        return rule?.isActive
          ? { marginPercent: rule.marginPercent.toNumber(), marginFlat: rule.marginFlat.toNumber(), marginType: (rule.marginType as MarginType) ?? "PERCENT" }
          : null;
      };

      if (airlineCode && flightNo) {
        const air = airlineCode.toUpperCase();
        if (cab !== ANY) {
          const exact = await lookup(air, flightNo, cab);
          if (exact) return exact;
        }
        const flightWide = await lookup(air, flightNo, ANY);
        if (flightWide) return flightWide;
      }
      if (cab !== ANY) {
        const routeCabin = await lookup(ANY, ANY, cab);
        if (routeCabin) return routeCabin;
      }
      const routeWide = await lookup(ANY, ANY, ANY);
      if (routeWide) return routeWide;
    }
    const setting = await this.getSetting();
    return { marginPercent: setting.marginPercent, marginFlat: setting.marginFlat, marginType: setting.marginType };
  }

  /** Only the number matching marginType is ever applied — percent and flat used to always stack
   * together, which made it impossible to tell an admin what a given rule would actually charge. */
  applyMargin(fare: FlightFareDto, margin: EffectiveMargin): FlightFareDto {
    const amount = margin.marginType === "FLAT" ? margin.marginFlat : margin.marginPercent;
    if (amount === 0) return fare;
    const adjustedTotal =
      margin.marginType === "FLAT"
        ? Math.round((fare.total + margin.marginFlat) * 100) / 100
        : Math.round((fare.total * (1 + margin.marginPercent / 100)) * 100) / 100;
    const delta = Math.round((adjustedTotal - fare.total) * 100) / 100;
    return { ...fare, total: adjustedTotal, base: Math.round((fare.base + delta) * 100) / 100 };
  }
}
