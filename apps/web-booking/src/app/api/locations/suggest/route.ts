import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestLocations } from "@/lib/locations";

const querySchema = z.object({
  q: z.string().max(80).optional().default(""),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const suggestions = suggestLocations(parsed.data.q, 14);
  return NextResponse.json({ suggestions });
}
