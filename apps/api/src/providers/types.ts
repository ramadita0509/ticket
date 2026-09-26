import type {
  AirportSuggestion,
  FlightOffer,
  FlightSearchParams,
} from "@ticket/shared";

export interface FlightProvider {
  readonly name: "amadeus" | "partner";
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
  suggestAirports(query: string): Promise<AirportSuggestion[]>;
}
