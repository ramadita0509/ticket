import Midtrans from "midtrans-client";
import { createHmac } from "node:crypto";

export function midtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY?.trim());
}

function snapClient() {
  return new Midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
  });
}

export async function createSnapToken(input: {
  orderId: string;
  amount: number;
  customer: { email: string; name: string; phone?: string };
}): Promise<{ token: string; redirectUrl?: string; mode: "live" | "mock" }> {
  if (!midtransConfigured()) {
    return {
      token: `mock-snap-${input.orderId}`,
      mode: "mock",
    };
  }

  const snap = snapClient();
  const parameter = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: Math.round(input.amount),
    },
    customer_details: {
      email: input.customer.email,
      first_name: input.customer.name,
      phone: input.customer.phone,
    },
  };

  const token = await snap.createTransactionToken(parameter);
  return { token: String(token), mode: "live" };
}

/** Verify Midtrans notification signature */
export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    // Mock mode: accept demo settlements
    return payload.signature_key === "mock-valid" || payload.order_id.startsWith("BOOK-");
  }
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const expected = createHmac("sha512", serverKey).update(raw).digest("hex");
  return expected === payload.signature_key;
}
