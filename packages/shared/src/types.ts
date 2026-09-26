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
  aircraft?: string;
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
  provider: "amadeus" | "partner";
  cabin?: string;
  seatsLeft?: number;
};

export type AirportSuggestion = {
  iataCode: string;
  name: string;
  cityName?: string;
  countryCode?: string;
  type: "airport" | "city";
};

export type FlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
  currencyCode?: string;
  max?: number;
};

export type FlightSearchResponse = {
  offers: FlightOffer[];
  searchId: string;
  cached: boolean;
};
