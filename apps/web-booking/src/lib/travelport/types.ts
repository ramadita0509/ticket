export type Money = {
  amount: string;
  currency: string;
};

export type FlightSegment = {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  duration: string;
  airlineCode: string;
  flightNumber: string;
};

export type FlightOffer = {
  id: string;
  price: Money;
  airline: string;
  airlineCodes: string[];
  segments: FlightSegment[];
  stops: number;
  totalDuration: string;
  bookingUrl: string | null;
  provider: "travelport" | "mock";
  cabin?: string;
  /** Opaque Travelport offer id for later price/book calls */
  travelportOfferId?: string;
};

export type FlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  currencyCode?: string;
};

export type FlightSearchResult = {
  offers: FlightOffer[];
  searchId: string;
  mode: "mock" | "live";
  cached?: boolean;
};
