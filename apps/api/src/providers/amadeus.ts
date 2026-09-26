import type {
  AirportSuggestion,
  FlightOffer,
  FlightSearchParams,
  FlightSegment,
} from "@ticket/shared";
import { filterStaticAirports } from "./static-airports.js";
import type { FlightProvider } from "./types.js";

type TokenState = {
  accessToken: string;
  expiresAt: number;
};

type AmadeusFlightOffer = {
  id: string;
  source?: string;
  numberOfBookableSeats?: number;
  itineraries?: Array<{
    duration?: string;
    segments?: Array<{
      departure?: { iataCode?: string; at?: string };
      arrival?: { iataCode?: string; at?: string };
      carrierCode?: string;
      number?: string;
      aircraft?: { code?: string };
      duration?: string;
    }>;
  }>;
  price?: {
    total?: string;
    currency?: string;
  };
  validatingAirlineCodes?: string[];
  travelerPricings?: Array<{
    fareDetailsBySegment?: Array<{ cabin?: string }>;
  }>;
};

type AmadeusLocation = {
  iataCode?: string;
  name?: string;
  subType?: string;
  address?: {
    cityName?: string;
    countryCode?: string;
  };
};

function parseIsoDuration(duration?: string): string {
  if (!duration) return "";
  // PT5H30M → 5j 30m
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}j` : "";
  const mins = match[2] ? `${match[2]}m` : "";
  return [hours, mins].filter(Boolean).join(" ") || duration;
}

export class AmadeusProvider implements FlightProvider {
  readonly name = "amadeus" as const;
  private token: TokenState | null = null;
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(opts?: {
    clientId?: string;
    clientSecret?: string;
    hostname?: string;
  }) {
    this.clientId = opts?.clientId ?? process.env.AMADEUS_CLIENT_ID ?? "";
    this.clientSecret =
      opts?.clientSecret ?? process.env.AMADEUS_CLIENT_SECRET ?? "";
    const host =
      opts?.hostname ??
      process.env.AMADEUS_HOSTNAME ??
      "test.api.amadeus.com";
    this.baseUrl = `https://${host}`;
  }

  get isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt - 30_000) {
      return this.token.accessToken;
    }
    if (!this.isConfigured) {
      throw new Error(
        "Amadeus credentials missing. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET."
      );
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Amadeus auth failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.token = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return this.token.accessToken;
  }

  private async amadeusFetch<T>(
    path: string,
    init?: RequestInit
  ): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Amadeus API ${path} failed (${res.status}): ${text}`);
    }
    return (await res.json()) as T;
  }

  private mapOffer(raw: AmadeusFlightOffer): FlightOffer {
    const itinerary = raw.itineraries?.[0];
    const rawSegments = itinerary?.segments ?? [];
    const segments: FlightSegment[] = rawSegments.map((s) => ({
      from: s.departure?.iataCode ?? "",
      to: s.arrival?.iataCode ?? "",
      departAt: s.departure?.at ?? "",
      arriveAt: s.arrival?.at ?? "",
      duration: parseIsoDuration(s.duration),
      airlineCode: s.carrierCode ?? "",
      flightNumber: `${s.carrierCode ?? ""}${s.number ?? ""}`,
      aircraft: s.aircraft?.code,
    }));

    const airlineCodes =
      raw.validatingAirlineCodes?.length
        ? raw.validatingAirlineCodes
        : [...new Set(segments.map((s) => s.airlineCode).filter(Boolean))];

    const cabin =
      raw.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin;

    return {
      id: raw.id,
      price: {
        amount: raw.price?.total ?? "0",
        currency: raw.price?.currency ?? "IDR",
      },
      airline: airlineCodes[0] ?? "Unknown",
      airlineCodes,
      segments,
      stops: Math.max(0, segments.length - 1),
      totalDuration: parseIsoDuration(itinerary?.duration),
      bookingUrl: null,
      provider: "amadeus",
      cabin,
      seatsLeft: raw.numberOfBookableSeats,
    };
  }

  async search(params: FlightSearchParams): Promise<FlightOffer[]> {
    const qs = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: String(params.adults),
      currencyCode: params.currencyCode ?? "IDR",
      max: String(params.max ?? 20),
      nonStop: "false",
    });

    const data = await this.amadeusFetch<{ data?: AmadeusFlightOffer[] }>(
      `/v2/shopping/flight-offers?${qs.toString()}`
    );

    return (data.data ?? []).map((o) => this.mapOffer(o));
  }

  async suggestAirports(query: string): Promise<AirportSuggestion[]> {
    if (!this.isConfigured) {
      return filterStaticAirports(query);
    }

    try {
      const qs = new URLSearchParams({
        keyword: query,
        subType: "AIRPORT,CITY",
        "page[limit]": "10",
      });
      const data = await this.amadeusFetch<{ data?: AmadeusLocation[] }>(
        `/v1/reference-data/locations?${qs.toString()}`
      );

      const mapped = (data.data ?? [])
        .filter((loc) => loc.iataCode)
        .map(
          (loc): AirportSuggestion => ({
            iataCode: loc.iataCode!,
            name: loc.name ?? loc.iataCode!,
            cityName: loc.address?.cityName,
            countryCode: loc.address?.countryCode,
            type: loc.subType === "CITY" ? "city" : "airport",
          })
        );

      return mapped.length > 0 ? mapped : filterStaticAirports(query);
    } catch {
      return filterStaticAirports(query);
    }
  }
}

/** Demo offers when credentials are missing — keeps UI developable offline */
export function demoOffers(params: FlightSearchParams): FlightOffer[] {
  const baseDate = params.departureDate;
  return [
    {
      id: "demo-ga-001",
      price: { amount: "1250000", currency: params.currencyCode ?? "IDR" },
      airline: "GA",
      airlineCodes: ["GA"],
      segments: [
        {
          from: params.origin,
          to: params.destination,
          departAt: `${baseDate}T06:30:00`,
          arriveAt: `${baseDate}T09:45:00`,
          duration: "3j 15m",
          airlineCode: "GA",
          flightNumber: "GA412",
        },
      ],
      stops: 0,
      totalDuration: "3j 15m",
      bookingUrl: null,
      provider: "amadeus",
      cabin: "ECONOMY",
      seatsLeft: 7,
    },
    {
      id: "demo-jt-002",
      price: { amount: "890000", currency: params.currencyCode ?? "IDR" },
      airline: "JT",
      airlineCodes: ["JT"],
      segments: [
        {
          from: params.origin,
          to: params.destination,
          departAt: `${baseDate}T11:00:00`,
          arriveAt: `${baseDate}T14:20:00`,
          duration: "3j 20m",
          airlineCode: "JT",
          flightNumber: "JT88",
        },
      ],
      stops: 0,
      totalDuration: "3j 20m",
      bookingUrl: null,
      provider: "amadeus",
      cabin: "ECONOMY",
      seatsLeft: 12,
    },
    {
      id: "demo-qg-003",
      price: { amount: "1050000", currency: params.currencyCode ?? "IDR" },
      airline: "QG",
      airlineCodes: ["QG"],
      segments: [
        {
          from: params.origin,
          to: "SUB",
          departAt: `${baseDate}T08:15:00`,
          arriveAt: `${baseDate}T09:40:00`,
          duration: "1j 25m",
          airlineCode: "QG",
          flightNumber: "QG400",
        },
        {
          from: "SUB",
          to: params.destination,
          departAt: `${baseDate}T11:10:00`,
          arriveAt: `${baseDate}T13:05:00`,
          duration: "1j 55m",
          airlineCode: "QG",
          flightNumber: "QG801",
        },
      ],
      stops: 1,
      totalDuration: "4j 50m",
      bookingUrl: null,
      provider: "amadeus",
      cabin: "ECONOMY",
      seatsLeft: 4,
    },
  ];
}
