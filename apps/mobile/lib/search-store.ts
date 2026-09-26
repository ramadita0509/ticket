import type { FlightOffer } from "@ticket/shared";

/** In-memory handoff of search results between screens (MVP) */
let lastOffers: FlightOffer[] = [];
let lastMeta: { demo?: boolean; searchId?: string } = {};

export function setSearchResults(
  offers: FlightOffer[],
  meta: { demo?: boolean; searchId?: string } = {}
) {
  lastOffers = offers;
  lastMeta = meta;
}

export function getSearchResults() {
  return { offers: lastOffers, meta: lastMeta };
}

export function getCachedOffer(id: string): FlightOffer | undefined {
  return lastOffers.find((o) => o.id === id);
}
