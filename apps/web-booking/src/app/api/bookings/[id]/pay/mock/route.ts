import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { midtransConfigured } from "@/lib/midtrans";
import { enqueueTicketing } from "@/lib/queue/ticketing";

/** Demo settlement when Midtrans keys are empty */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (midtransConfigured()) {
    return NextResponse.json(
      { error: "Use Midtrans Snap when keys are configured" },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { transactions: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ booking: { id, status: booking.status } });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "PAID" },
  });

  const tx = booking.transactions[0];
  if (tx) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: "SETTLEMENT",
        transactionId: `mock-${id}`,
        rawResponse: JSON.stringify({ mock: true, settledAt: new Date() }),
      },
    });
  }

  await enqueueTicketing(id);

  return NextResponse.json({ ok: true, status: "PAID" });
}
