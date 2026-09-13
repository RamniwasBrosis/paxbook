import { Injectable, Logger } from "@nestjs/common";
import type { FareRuleWindowDto, FareRulesDto, FlightCancellationEstimateDto } from "@paxbook/types";
import { FtdClientService } from "./ftd-client.service";
import { mapFareRules } from "./flight-response-mapper";

export interface CancellationEstimateInput {
  flightId: string | null;
  providerFareAmount: { toNumber(): number } | null;
  passengerCount: number;
  /** The overall origin-destination pair of the journey (first leg's departure, LAST leg's arrival)
   * — FTD's Fare Rules journey_segment describes the whole O&D, not each physical flight leg. */
  journeyDepCode: string;
  journeyArrCode: string;
  journeyDepDateTime: string;
  currency: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function unavailable(currency: string, note: string): { dto: FlightCancellationEstimateDto; snapshot: unknown } {
  return {
    dto: { available: false, estimatedRefundAmount: null, cancellationFee: null, currency, note, computedAt: new Date().toISOString() },
    snapshot: { reason: note },
  };
}

/**
 * The one place FTD's real Fare Rules response becomes a ₹ estimate — never fabricates a number.
 * FTD's own spec says its Fare Rules response is one of two shapes ("Either of them will be
 * available"): a structured, computable cancellation-fee schedule, or just an HTML blob with no
 * usable numbers. Every branch below that can't confidently compute a real figure returns
 * `available: false` with a plain-language reason instead of guessing or throwing — callers (both
 * the customer-facing preview and the frozen cancel-time computation) must fall back to the
 * existing qualitative-only refundable/non-refundable messaging in that case.
 *
 * Confirmed business decision: the airline's cancellation fee is deducted from the provider's own
 * fare only — Paxbook's margin is never refunded, in any scenario. So
 * estimatedRefund = max(0, providerFareAmount - cancellationFee); margin is excluded entirely.
 *
 * Window direction, amount_type semantics, journey_segment scope, and per-passenger fee scope were
 * all verified against real FTD test-mode responses (2026-09-13, see conversation notes) before
 * shipping — not guesses: a real DEL-BOM fare returned windows [5,74)→₹3500 then [74,8760)→₹3000
 * (smaller numbers closer to departure, higher fee closer to departure — confirms matchWindow's
 * direction), and a real "Non Refundable" fare returned amount_type:1, amount:100 (confirms
 * 1=percentage). A real 3-leg connecting itinerary (DEL-HYD-MAA-BOM) had fare rules listing only
 * "DEL-BOM" as the journey_segment — proving it describes the whole origin-destination pair, not
 * each physical flight leg, which is why this only ever needs the journey's overall dep/arr codes
 * (see CancellationEstimateInput), not per-leg summation. The response's own genRemarks states
 * charges are "Per Pax Per Sector", confirming fixed fees are per-passenger — "sector" here means
 * per direction of travel (onward vs return), consistent with journey_segment being the whole O&D.
 */
@Injectable()
export class FlightCancellationEstimateService {
  private readonly logger = new Logger(FlightCancellationEstimateService.name);

  constructor(private readonly ftd: FtdClientService) {}

  async estimate(booking: CancellationEstimateInput): Promise<{ dto: FlightCancellationEstimateDto; snapshot: unknown }> {
    const { flightId, providerFareAmount, passengerCount, journeyDepCode, journeyArrCode, journeyDepDateTime, currency } = booking;

    if (!flightId || !providerFareAmount || !journeyDepCode || !journeyArrCode || !journeyDepDateTime) {
      return unavailable(currency, "This booking is missing details needed to estimate a refund. Our team will confirm the amount manually.");
    }

    let raw: Record<string, unknown>;
    try {
      raw = await this.ftd.fareRules(Number(flightId));
    } catch (err) {
      this.logger.warn(`fareRules call failed for flightId ${flightId}: ${(err as Error).message}`);
      return unavailable(currency, "We couldn't reach the airline for cancellation terms just now. Our team will confirm the refund amount manually.");
    }

    const fareRules: FareRulesDto = mapFareRules(raw);
    if (fareRules.kind === "html") {
      return unavailable(currency, "This fare's cancellation terms are only available as general policy text — no automatic refund estimate could be calculated. Our team will review it manually.");
    }
    if (fareRules.cancellation.length === 0) {
      return unavailable(currency, "The airline did not publish a cancellation-fee schedule for this fare. Our team will confirm the refund amount manually.");
    }

    const journeySegment = `${journeyDepCode}-${journeyArrCode}`.toUpperCase();
    const candidates = fareRules.cancellation.filter((w) => w.journeySegment.trim().toUpperCase() === journeySegment);
    if (candidates.length === 0) {
      return unavailable(currency, `No matching cancellation-fee rule was found for ${journeySegment} in the airline's fare rules. Our team will confirm the refund amount manually.`);
    }

    const departure = new Date(journeyDepDateTime);
    const hoursUntilDeparture = (departure.getTime() - Date.now()) / (1000 * 60 * 60);
    const window = matchWindow(candidates, hoursUntilDeparture);
    if (!window) {
      return unavailable(currency, "No cancellation-fee window in the airline's fare rules covers the current time before departure. Our team will confirm the refund amount manually.");
    }

    const providerFare = providerFareAmount.toNumber();
    // amountType: 0 = fixed ₹ per-passenger (confirmed by a real response's own "Per Pax Per Sector"
    // remark), 1 = percentage applied once against the whole booking's provider fare — mathematically
    // identical to per-passenger-then-summed for a uniform percentage, so no separate handling needed.
    const fee = window.amountType === 1 ? (providerFare * window.amount) / 100 : window.amount * passengerCount;
    const cancellationFee = round2(Math.min(fee, providerFare));
    const estimatedRefundAmount = round2(Math.max(0, providerFare - fee));

    const feeDescription = window.amountType === 1 ? `${window.amount}%` : `₹${window.amount} per passenger`;
    const note = `Based on the airline's cancellation policy for ${journeySegment} (${window.remarks || `${feeDescription} cancellation fee`}). This excludes Paxbook's service fee, which is never refunded — our team will confirm the final amount after cancellation.`;

    return {
      dto: { available: true, estimatedRefundAmount, cancellationFee, currency, note, computedAt: new Date().toISOString() },
      snapshot: { journeySegment, hoursUntilDeparture, matchedWindow: window, allCandidates: candidates },
    };
  }
}

/**
 * Picks the cancellation-fee window covering the current time-before-departure. `start` is closer
 * to departure, `end` is further out (both converted to hours), i.e. the window is `[start, end)`
 * hours-before-departure — e.g. start:5,end:74 = "5 to 74 hours before departure". Confirmed
 * against a real FTD response (see this file's class comment) rather than assumed.
 */
function matchWindow(candidates: FareRuleWindowDto[], hoursUntilDeparture: number): FareRuleWindowDto | undefined {
  const toHours = (value: number, type: 0 | 1) => (type === 1 ? value * 24 : value);
  return candidates.find((w) => {
    const start = toHours(w.start, w.startType);
    const end = toHours(w.end, w.endType);
    return hoursUntilDeparture >= start && hoursUntilDeparture < end;
  });
}
