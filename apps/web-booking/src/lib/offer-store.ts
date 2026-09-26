import type { FlightOffer } from "@/lib/travelport/types";
import type { PricedOffer } from "@/lib/travelport/booking-types";

type OfferEntry = {
  offer: FlightOffer;
  priced?: PricedOffer;
  expiresAt: number;
};

const globalStore = globalThis as unknown as {
  __ticketOfferStore?: Map<string, OfferEntry>;
};

function store() {
  if (!globalStore.__ticketOfferStore) {
    globalStore.__ticketOfferStore = new Map();
  }
  return globalStore.__ticketOfferStore;
}

const TTL_MS = 30 * 60_000;

export function saveSearchOffers(offers: FlightOffer[]): void {
  const s = store();
  const expiresAt = Date.now() + TTL_MS;
  for (const offer of offers) {
    s.set(offer.id, { offer, expiresAt });
  }
}

export function getOffer(id: string): FlightOffer | null {
  const entry = store().get(id);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) store().delete(id);
    return null;
  }
  return entry.offer;
}

export function savePricedOffer(priced: PricedOffer): void {
  const s = store();
  s.set(priced.offer.id, {
    offer: priced.offer,
    priced,
    expiresAt: new Date(priced.expiresAt).getTime(),
  });
}

export function getPricedOffer(id: string): PricedOffer | null {
  const entry = store().get(id);
  if (!entry?.priced || Date.now() > entry.expiresAt) return null;
  return entry.priced;
}
