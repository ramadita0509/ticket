import { randomUUID } from "node:crypto";
import type { FlightOffer } from "./types";
import type {
  BookPassenger,
  PricedOffer,
  ReservationResult,
  TicketingResult,
} from "./booking-types";
import { getTravelportMode } from "./index";

function money(amount: number, currency = "IDR") {
  return { amount: String(Math.round(amount)), currency };
}

/** Confirm fare before passenger form (Air Price equivalent) */
export async function priceOffer(offer: FlightOffer): Promise<PricedOffer> {
  const mode = getTravelportMode();
  if (mode === "live") {
    // Live TripServices price endpoint — wire when credentials arrive
    throw new Error(
      "Live Travelport pricing not wired yet. Set TRAVELPORT_MODE=mock."
    );
  }

  const total = Number(offer.price.amount);
  const base = Math.round(total * 0.78);
  const taxes = Math.round(total * 0.18);
  const fees = Math.max(0, total - base - taxes);
  const now = Date.now();

  return {
    offer: { ...offer, price: { ...offer.price, amount: String(total) } },
    fare: {
      base: money(base, offer.price.currency),
      taxes: money(taxes, offer.price.currency),
      fees: money(fees, offer.price.currency),
      total: money(total, offer.price.currency),
    },
    pricedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 15 * 60_000).toISOString(),
    travelportPriceId: `price-${offer.id}-${randomUUID().slice(0, 8)}`,
  };
}

/** Create PNR / workbench reservation (AirCreateReservation equivalent) */
export async function createReservation(input: {
  priced: PricedOffer;
  passengers: BookPassenger[];
  contactEmail: string;
  contactPhone?: string;
}): Promise<ReservationResult> {
  const mode = getTravelportMode();
  if (mode === "live") {
    throw new Error(
      "Live Travelport booking not wired yet. Set TRAVELPORT_MODE=mock."
    );
  }

  if (!input.passengers.length) {
    throw new Error("At least one passenger is required");
  }

  // Mock PNR: 6 alphanumeric like Galileo record locator
  const pnr = Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[
      Math.floor(Math.random() * 32)
    ]
  ).join("");

  return {
    pnr,
    status: "PENDING_PAYMENT",
    travelportReservationId: `res-${randomUUID()}`,
  };
}

/** Issue e-tickets after payment (AirTicketing equivalent) */
export async function issueTickets(input: {
  pnr: string;
  passengerCount: number;
}): Promise<TicketingResult> {
  const mode = getTravelportMode();
  if (mode === "live") {
    throw new Error(
      "Live Travelport ticketing not wired yet. Set TRAVELPORT_MODE=mock."
    );
  }

  const ticketNumbers = Array.from({ length: input.passengerCount }, (_, i) => {
    const body = String(1_000_000_000_000 + Math.floor(Math.random() * 9e11)).slice(
      0,
      13
    );
    return body;
  });

  return { ticketNumbers, status: "ISSUED" };
}
