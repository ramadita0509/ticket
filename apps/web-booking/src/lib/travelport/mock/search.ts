import type { FlightSearchParams } from "../types";

/** Simplified TripServices CatalogProductOfferings-shaped fixture for mock mode */
export function buildMockCatalogResponse(params: FlightSearchParams) {
  const { origin, destination, departureDate } = params;
  const nextDay = addDays(departureDate, 1);

  return {
    "@type": "CatalogProductOfferingsResponse",
    transactionId: `mock-${Date.now()}`,
    CatalogProductOfferings: {
      "@type": "CatalogProductOfferings",
      Identifier: { value: `search-${origin}-${destination}` },
      CatalogProductOffering: [
        mockOffering({
          id: `mock-qr-${origin}-${destination}`,
          airline: "QR",
          airlineName: "Qatar Airways",
          origin,
          destination,
          via: "DOH",
          depart: `${departureDate}T18:30:00`,
          arriveVia: `${departureDate}T23:10:00`,
          departVia: `${nextDay}T01:45:00`,
          arrive: `${nextDay}T03:20:00`,
          total: 19074200,
          base: 15000000,
          taxes: 4074200,
          stops: 1,
          durationMinutes: 770,
        }),
        mockOffering({
          id: `mock-ga-${origin}-${destination}`,
          airline: "GA",
          airlineName: "Garuda Indonesia",
          origin,
          destination,
          depart: `${departureDate}T14:05:00`,
          arrive: `${nextDay}T02:15:00`,
          total: 20455200,
          base: 17500000,
          taxes: 2955200,
          stops: 0,
          durationMinutes: 550,
        }),
        mockOffering({
          id: `mock-sv-${origin}-${destination}`,
          airline: "SV",
          airlineName: "Saudia",
          origin,
          destination,
          via: "RUH",
          depart: `${departureDate}T22:40:00`,
          arriveVia: `${nextDay}T04:10:00`,
          departVia: `${nextDay}T06:00:00`,
          arrive: `${nextDay}T07:30:00`,
          total: 14584658,
          base: 12000000,
          taxes: 2584658,
          stops: 1,
          durationMinutes: 890,
        }),
        mockOffering({
          id: `mock-ek-${origin}-${destination}`,
          airline: "EK",
          airlineName: "Emirates",
          origin,
          destination,
          via: "DXB",
          depart: `${departureDate}T19:55:00`,
          arriveVia: `${nextDay}T00:40:00`,
          departVia: `${nextDay}T02:15:00`,
          arrive: `${nextDay}T04:05:00`,
          total: 22455870,
          base: 19000000,
          taxes: 3455870,
          stops: 1,
          durationMinutes: 790,
        }),
        mockOffering({
          id: `mock-mh-${origin}-${destination}`,
          airline: "MH",
          airlineName: "Malaysia Airlines",
          origin,
          destination,
          via: "KUL",
          via2: "DOH",
          depart: `${departureDate}T09:20:00`,
          arriveVia: `${departureDate}T12:05:00`,
          departVia: `${departureDate}T14:30:00`,
          arriveVia2: `${departureDate}T17:50:00`,
          departVia2: `${departureDate}T20:10:00`,
          arrive: `${departureDate}T22:00:00`,
          total: 13038152,
          base: 10500000,
          taxes: 2538152,
          stops: 2,
          durationMinutes: 1420,
        }),
      ],
    },
  };
}

function mockOffering(input: {
  id: string;
  airline: string;
  airlineName: string;
  origin: string;
  destination: string;
  via?: string;
  via2?: string;
  depart: string;
  arriveVia?: string;
  departVia?: string;
  arriveVia2?: string;
  departVia2?: string;
  arrive: string;
  total: number;
  base: number;
  taxes: number;
  stops: number;
  durationMinutes: number;
}) {
  const products = [];
  if (input.stops === 0) {
    products.push({
      from: input.origin,
      to: input.destination,
      depart: input.depart,
      arrive: input.arrive,
      flightNumber: `${input.airline}980`,
    });
  } else if (input.stops === 1 && input.via) {
    products.push(
      {
        from: input.origin,
        to: input.via,
        depart: input.depart,
        arrive: input.arriveVia!,
        flightNumber: `${input.airline}100`,
      },
      {
        from: input.via,
        to: input.destination,
        depart: input.departVia!,
        arrive: input.arrive,
        flightNumber: `${input.airline}200`,
      }
    );
  } else if (input.via && input.via2) {
    products.push(
      {
        from: input.origin,
        to: input.via,
        depart: input.depart,
        arrive: input.arriveVia!,
        flightNumber: `${input.airline}716`,
      },
      {
        from: input.via,
        to: input.via2,
        depart: input.departVia!,
        arrive: input.arriveVia2!,
        flightNumber: `${input.airline}164`,
      },
      {
        from: input.via2,
        to: input.destination,
        depart: input.departVia2!,
        arrive: input.arrive,
        flightNumber: `${input.airline}180`,
      }
    );
  }

  return {
    "@type": "CatalogProductOffering",
    id: input.id,
    airlineCode: input.airline,
    airlineName: input.airlineName,
    stops: input.stops,
    durationMinutes: input.durationMinutes,
    cabin: "ECONOMY",
    Price: {
      CurrencyCode: { value: "IDR" },
      Base: input.base,
      TotalTaxes: input.taxes,
      TotalPrice: input.total,
    },
    Product: products.map((p) => ({
      "@type": "ProductAir",
      FlightSegment: {
        carrier: input.airline,
        flightNumber: p.flightNumber,
        Departure: { location: p.from, date: p.depart },
        Arrival: { location: p.to, date: p.arrive },
      },
    })),
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
