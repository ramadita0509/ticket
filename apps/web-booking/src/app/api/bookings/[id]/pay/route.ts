import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSnapToken } from "@/lib/midtrans";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { passengers: true, transactions: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: `Booking status is ${booking.status}` },
      { status: 409 }
    );
  }

  const lead = booking.passengers[0];
  const customerName = lead
    ? `${lead.firstName} ${lead.lastName}`
    : "Guest";

  try {
    const snap = await createSnapToken({
      orderId: booking.id,
      amount: booking.totalAmount,
      customer: {
        email: booking.contactEmail ?? "guest@ticket.local",
        name: customerName,
        phone: booking.contactPhone ?? undefined,
      },
    });

    await prisma.booking.update({
      where: { id },
      data: { paymentToken: snap.token },
    });

    const tx = booking.transactions[0];
    if (tx) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          transactionId: snap.token,
          rawResponse: JSON.stringify(snap),
        },
      });
    }

    return NextResponse.json({
      token: snap.token,
      mode: snap.mode,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
      isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
    });
  } catch (err) {
    console.error("Snap create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment init failed" },
      { status: 502 }
    );
  }
}
