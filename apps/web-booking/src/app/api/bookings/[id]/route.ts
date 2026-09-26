import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      passengers: true,
      segments: { orderBy: { sequence: "asc" } },
      transactions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      id: booking.id,
      pnr: booking.bookingReference,
      status: booking.status,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      origin: booking.origin,
      destination: booking.destination,
      departureDate: booking.departureDate.toISOString(),
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      hasTicketPdf: Boolean(booking.ticketPdfPath),
      passengers: booking.passengers.map((p) => ({
        id: p.id,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        type: p.type,
        ticketNumber: p.ticketNumber,
      })),
      segments: booking.segments.map((s) => ({
        flightNumber: s.flightNumber,
        airlineCode: s.airlineCode,
        from: s.departureAirport,
        to: s.arrivalAirport,
        departAt: s.departureTime.toISOString(),
        arriveAt: s.arrivalTime.toISOString(),
      })),
      payment: booking.transactions[0]
        ? {
            status: booking.transactions[0].status,
            amount: booking.transactions[0].amount,
          }
        : null,
    },
  });
}
