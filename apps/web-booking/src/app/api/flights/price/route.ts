import { NextResponse } from "next/server";
import { z } from "zod";
import { getOffer, savePricedOffer } from "@/lib/offer-store";
import { priceOffer } from "@/lib/travelport/booking";

const bodySchema = z.object({
  offerId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const offer = getOffer(parsed.data.offerId);
  if (!offer) {
    return NextResponse.json(
      { error: "Offer expired or not found. Search again." },
      { status: 404 }
    );
  }

  try {
    const priced = await priceOffer(offer);
    savePricedOffer(priced);
    return NextResponse.json({ priced });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Price failed" },
      { status: 502 }
    );
  }
}
