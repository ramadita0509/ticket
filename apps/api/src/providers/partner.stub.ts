import type {
  AirportSuggestion,
  FlightOffer,
  FlightSearchParams,
} from "@ticket/shared";
import type { FlightProvider } from "./types.js";

/**
 * Stub for a future local/partner aggregator.
 * Wire this in when you have deep-link booking URLs.
 */
export class PartnerProvider implements FlightProvider {
  readonly name = "partner" as const;

  async search(_params: FlightSearchParams): Promise<FlightOffer[]> {
    throw new Error("PartnerProvider not configured yet");
  }

  async suggestAirports(_query: string): Promise<AirportSuggestion[]> {
    return [];
  }
}
