import { randomUUID } from "node:crypto";
import { getTravelportAccessToken } from "./auth";
import { buildMockCatalogResponse } from "./mock/search";
import { normalizeCatalogOfferings } from "./normalize";
import type { FlightSearchParams, FlightSearchResult } from "./types";

/**
 * TripServices Air Search
 * POST {base}/air/catalog/search/catalogproductofferings
 * @see https://developer.travelport.com/docs/flights/guides/flights-search-guide
 */
export function getTravelportMode(): "mock" | "live" {
  return process.env.TRAVELPORT_MODE === "live" ? "live" : "mock";
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  const mode = getTravelportMode();
  const searchId = randomUUID();

  if (mode === "mock") {
    const raw = buildMockCatalogResponse(params);
    return {
      offers: normalizeCatalogOfferings(raw, "mock"),
      searchId,
      mode: "mock",
    };
  }

  const raw = await liveCatalogSearch(params);
  return {
    offers: normalizeCatalogOfferings(raw, "travelport"),
    searchId,
    mode: "live",
  };
}

async function liveCatalogSearch(params: FlightSearchParams): Promise<unknown> {
  const base =
    process.env.TRAVELPORT_BASE_URL ?? "https://api.pp.travelport.net/11";
  const accessGroup = process.env.TRAVELPORT_ACCESS_GROUP;
  if (!accessGroup) {
    throw new Error("TRAVELPORT_ACCESS_GROUP is required in live mode");
  }

  const token = await getTravelportAccessToken();
  const body = buildSearchRequest(params);

  const res = await fetch(
    `${base.replace(/\/$/, "")}/air/catalog/search/catalogproductofferings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        XAUTH_TRAVELPORT_ACCESSGROUP: accessGroup,
        TraceId: randomUUID(),
        ...(process.env.TRAVELPORT_PCC
          ? { "TVPC-PCC-Core": process.env.TRAVELPORT_PCC }
          : {}),
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Travelport search failed (${res.status}): ${text}`);
  }

  return res.json();
}

/** Minimal CatalogProductOfferingsQueryRequest payload */
export function buildSearchRequest(params: FlightSearchParams) {
  const passengers: { passengerTypeCode: string; number: number }[] = [
    { passengerTypeCode: "ADT", number: params.adults },
  ];
  if (params.children && params.children > 0) {
    passengers.push({ passengerTypeCode: "CHD", number: params.children });
  }
  if (params.infants && params.infants > 0) {
    passengers.push({ passengerTypeCode: "INF", number: params.infants });
  }

  const searchCriteria = [
    {
      "@type": "SearchCriteriaFlight",
      departureDate: params.departureDate,
      From: { value: params.origin },
      To: { value: params.destination },
    },
  ];

  if (params.returnDate) {
    searchCriteria.push({
      "@type": "SearchCriteriaFlight",
      departureDate: params.returnDate,
      From: { value: params.destination },
      To: { value: params.origin },
    });
  }

  return {
    "@type": "CatalogProductOfferingsQueryRequest",
    CatalogProductOfferingsRequest: {
      "@type": "CatalogProductOfferingsRequestAir",
      maxNumberOfUpsellsToReturn: 0,
      offersPerPage: 20,
      PassengerCriteria: passengers.map((p) => ({
        "@type": "PassengerCriteria",
        number: p.number,
        passengerTypeCode: p.passengerTypeCode,
      })),
      SearchCriteriaFlight: searchCriteria,
      ...(params.currencyCode
        ? {
            PricingModifiersAir: {
              currencyCode: params.currencyCode,
            },
          }
        : {}),
    },
  };
}
