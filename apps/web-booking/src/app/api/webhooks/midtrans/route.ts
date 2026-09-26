import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { enqueueTicketing } from "@/lib/queue/ticketing";

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
    transaction_status?: string;
    fraud_status?: string;
    transaction_id?: string;
  } | null;

  if (
    !payload?.order_id ||
    !payload.status_code ||
    !payload.gross_amount ||
    !payload.signature_key
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    !verifyMidtransSignature({
      order_id: payload.order_id,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
      signature_key: payload.signature_key,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.order_id },
    include: { transactions: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const status = payload.transaction_status ?? "";
  const fraud = payload.fraud_status ?? "";
  const paid =
    status === "capture" || status === "settlement"
      ? fraud !== "deny"
      : status === "pending"
        ? false
        : false;

  const tx = booking.transactions[0];
  if (tx) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: status.toUpperCase() || "UNKNOWN",
        transactionId: payload.transaction_id ?? tx.transactionId,
        rawResponse: JSON.stringify(payload),
      },
    });
  }

  if (paid && booking.status === "PENDING_PAYMENT") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "PAID" },
    });
    await enqueueTicketing(booking.id);
  } else if (status === "deny" || status === "cancel" || status === "expire") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ ok: true });
}
