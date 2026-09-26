import { Hono } from "hono";
import {
  airportSuggestQuerySchema,
  flightSearchBodySchema,
  type FlightOffer,
  type FlightSearchResponse,
} from "@ticket/shared";
import {
  OFFER_TTL_MS,
  SEARCH_TTL_MS,
  offerCache,
  searchCache,
} from "../cache.js";
import { AmadeusProvider, demoOffers } from "../providers/amadeus.js";
import { filterStaticAirports } from "../providers/static-airports.js";
import { randomUUID } from "node:crypto";

const provider = new AmadeusProvider();

export const flightsRouter = new Hono();

flightsRouter.get("/airports/suggest", async (c) => {
  const parsed = airportSuggestQuerySchema.safeParse({
    q: c.req.query("q"),
  });
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { q } = parsed.data;
  try {
    const suggestions = await provider.suggestAirports(q);
    return c.json({ suggestions });
  } catch {
    return c.json({ suggestions: filterStaticAirports(q) });
  }
});

flightsRouter.post("/flights/search", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = flightSearchBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const params = parsed.data;
  if (params.origin === params.destination) {
    return c.json({ error: "origin and destination must differ" }, 400);
  }

  const cacheKey = [
    params.origin,
    params.destination,
    params.departureDate,
    params.adults,
    params.currencyCode,
    params.max,
  ].join(":");

  const cached = searchCache.get<{
    offers: FlightOffer[];
    searchId: string;
  }>(cacheKey);

  if (cached) {
    const response: FlightSearchResponse = {
      offers: cached.offers,
      searchId: cached.searchId,
      cached: true,
    };
    return c.json(response);
  }

  let offers: FlightOffer[];
  let usedDemo = false;

  if (!provider.isConfigured) {
    offers = demoOffers(params);
    usedDemo = true;
  } else {
    try {
      offers = await provider.search(params);
    } catch (err) {
      console.error("Amadeus search error:", err);
      offers = demoOffers(params);
      usedDemo = true;
    }
  }

  // Sort cheapest first for MVP
  offers = [...offers].sort(
    (a, b) => Number(a.price.amount) - Number(b.price.amount)
  );

  const searchId = randomUUID();
  searchCache.set(cacheKey, { offers, searchId }, SEARCH_TTL_MS);

  for (const offer of offers) {
    offerCache.set(offer.id, offer, OFFER_TTL_MS);
  }

  const response: FlightSearchResponse & { demo?: boolean } = {
    offers,
    searchId,
    cached: false,
    ...(usedDemo ? { demo: true } : {}),
  };
  return c.json(response);
});

flightsRouter.get("/flights/offers/:id", async (c) => {
  const id = c.req.param("id");
  const offer = offerCache.get<FlightOffer>(id);
  if (!offer) {
    return c.json(
      { error: "Offer not found or expired. Please search again." },
      404
    );
  }
  return c.json({ offer });
});
