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
  adults: z.coerce.number().int().min(1).max(9).default(1),
  currencyCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/)
    .optional()
    .default("IDR"),
  max: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type FlightSearchBody = z.infer<typeof flightSearchBodySchema>;

export const airportSuggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(64),
});
