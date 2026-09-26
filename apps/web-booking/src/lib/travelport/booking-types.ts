import type { FlightOffer, Money } from "./types";

export type FareBreakdown = {
  base: Money;
  taxes: Money;
  fees: Money;
  total: Money;
};

export type PricedOffer = {
  offer: FlightOffer;
  fare: FareBreakdown;
  pricedAt: string;
  expiresAt: string;
  travelportPriceId: string;
};

export type BookPassenger = {
  title: string;
  firstName: string;
  lastName: string;
  type: "ADULT" | "CHILD" | "INFANT";
  idNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
};

export type ReservationResult = {
  pnr: string;
  status: "PENDING_PAYMENT";
  travelportReservationId: string;
};

export type TicketingResult = {
  ticketNumbers: string[];
  status: "ISSUED";
};
