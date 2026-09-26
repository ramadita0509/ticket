import type { FlightOffer, FlightSegment } from "./types";

/** Normalize TripServices (or mock) catalog response → domain FlightOffer[] */
export function normalizeCatalogOfferings(
  raw: unknown,
  provider: "travelport" | "mock"
): FlightOffer[] {
  const root = raw as {
    CatalogProductOfferings?: {
      CatalogProductOffering?: unknown[];
    };
  };

  const offerings = root.CatalogProductOfferings?.CatalogProductOffering ?? [];
  const offers: FlightOffer[] = [];

  for (const item of offerings) {
    const o = item as Record<string, unknown>;
    const id = String(o.id ?? cryptoRandom());
    const airlineCode = String(o.airlineCode ?? "XX");
    const airlineName = String(o.airlineName ?? airlineCode);
    const stops = Number(o.stops ?? 0);
    const cabin = String(o.cabin ?? "ECONOMY");
    const durationMinutes = Number(o.durationMinutes ?? 0);

    const priceObj = o.Price as
      | {
          CurrencyCode?: { value?: string };
          TotalPrice?: number;
          Base?: number;
        }
      | undefined;

    const currency = priceObj?.CurrencyCode?.value ?? "IDR";
    const amount = String(priceObj?.TotalPrice ?? 0);

    const products = (o.Product as unknown[]) ?? [];
    const segments: FlightSegment[] = [];

    for (const prod of products) {
      const p = prod as {
        FlightSegment?: {
          carrier?: string;
          flightNumber?: string;
          Departure?: { location?: string; date?: string };
          Arrival?: { location?: string; date?: string };
        };
      };
      const fs = p.FlightSegment;
      if (!fs) continue;
      const from = fs.Departure?.location ?? "";
      const to = fs.Arrival?.location ?? "";
      const departAt = fs.Departure?.date ?? "";
      const arriveAt = fs.Arrival?.date ?? "";
      segments.push({
        from,
        to,
        departAt,
        arriveAt,
        duration: durationBetween(departAt, arriveAt),
        airlineCode: fs.carrier ?? airlineCode,
        flightNumber: fs.flightNumber ?? airlineCode,
      });
    }

    if (!segments.length) continue;

    offers.push({
      id,
      price: { amount, currency },
      airline: airlineName,
      airlineCodes: [airlineCode],
      segments,
      stops,
      totalDuration: formatDuration(durationMinutes),
      bookingUrl: null,
      provider,
      cabin,
      travelportOfferId: id,
    });
  }

  return offers.sort(
    (a, b) => Number(a.price.amount) - Number(b.price.amount)
  );
}

function durationBetween(start: string, end: string): string {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return "—";
  return formatDuration(Math.round((b - a) / 60_000));
}

function formatDuration(mins: number): string {
  if (!mins || mins < 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}j ${m}m`;
}

function cryptoRandom(): string {
  return `offer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
