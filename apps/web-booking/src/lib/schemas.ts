import { z } from "zod";

export const flightSearchBodySchema = z.object({
  origin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "origin must be a 3-letter IATA code"),
  destination: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "destination must be a 3-letter IATA code"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "departureDate must be YYYY-MM-DD"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(8).optional().default(0),
  infants: z.coerce.number().int().min(0).max(4).optional().default(0),
  travelClass: z
    .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
    .optional()
    .default("ECONOMY"),
  currencyCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/)
    .optional()
    .default("IDR"),
});

export type FlightSearchBody = z.infer<typeof flightSearchBodySchema>;
