import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getOffer, getPricedOffer, savePricedOffer } from "@/lib/offer-store";
import { createReservation, priceOffer } from "@/lib/travelport/booking";

const passengerSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Mstr", "Miss"]),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  type: z.enum(["ADULT", "CHILD", "INFANT"]).default("ADULT"),
  idNumber: z.string().max(40).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  nationality: z.string().max(2).optional(),
});

const bodySchema = z.object({
  offerId: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(30).optional(),
  passengers: z.array(passengerSchema).min(1).max(9),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { offerId, contactEmail, contactPhone, passengers } = parsed.data;

  let priced = getPricedOffer(offerId);
  if (!priced) {
    const offer = getOffer(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer expired or not found. Search again." },
        { status: 404 }
      );
    }
    priced = await priceOffer(offer);
    savePricedOffer(priced);
  }

  if (new Date(priced.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Fare expired. Please search and price again." },
      { status: 410 }
    );
  }

  try {
    const reservation = await createReservation({
      priced,
      passengers,
      contactEmail,
      contactPhone,
    });

    const first = priced.offer.segments[0];
    const last = priced.offer.segments[priced.offer.segments.length - 1];
    const total = Number(priced.fare.total.amount);

    const booking = await prisma.booking.create({
      data: {
        bookingReference: reservation.pnr,
        provider: "TRAVELPORT",
        totalAmount: total,
        currency: priced.fare.total.currency,
        status: "PENDING_PAYMENT",
        origin: first?.from ?? "",
        destination: last?.to ?? "",
        departureDate: new Date(first?.departAt ?? Date.now()),
        cabinClass: priced.offer.cabin ?? "ECONOMY",
        contactEmail,
        contactPhone,
        rawOfferJson: JSON.stringify(priced.offer),
        pricedOfferJson: JSON.stringify(priced),
        passengers: {
          create: passengers.map((p) => ({
            title: p.title,
            firstName: p.firstName,
            lastName: p.lastName,
            type: p.type,
            idNumber: p.idNumber,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
            nationality: p.nationality,
          })),
        },
        segments: {
          create: priced.offer.segments.map((s, i) => ({
            sequence: i + 1,
            airlineCode: s.airlineCode,
            flightNumber: s.flightNumber,
            departureAirport: s.from,
            arrivalAirport: s.to,
            departureTime: new Date(s.departAt),
            arrivalTime: new Date(s.arriveAt),
            cabinClass: priced.offer.cabin,
          })),
        },
        transactions: {
          create: {
            paymentGateway: "MIDTRANS",
            status: "PENDING",
            amount: total,
            currency: priced.fare.total.currency,
          },
        },
      },
      include: {
        passengers: true,
        segments: { orderBy: { sequence: "asc" } },
        transactions: true,
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        pnr: booking.bookingReference,
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        origin: booking.origin,
        destination: booking.destination,
      },
    });
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Booking failed" },
      { status: 502 }
    );
  }
}
