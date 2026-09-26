import { NextResponse } from "next/server";
import { flightSearchBodySchema } from "@/lib/schemas";
import { searchFlights } from "@/lib/travelport";
import { saveSearchOffers } from "@/lib/offer-store";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = flightSearchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.origin === parsed.data.destination) {
    return NextResponse.json(
      { error: "origin and destination must differ" },
      { status: 400 }
    );
  }

  try {
    const result = await searchFlights(parsed.data);
    saveSearchOffers(result.offers);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Travelport search error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Flight search failed",
      },
      { status: 502 }
    );
  }
}
