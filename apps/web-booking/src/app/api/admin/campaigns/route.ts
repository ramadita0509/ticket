import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { listAllCampaigns, toCampaignDTO } from "@/lib/home-campaigns";

const bodySchema = z.object({
  title: z.string().min(1),
  periodLabel: z.string().min(1),
  airlineName: z.string().min(1),
  partnerBanner: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  airlineLogoUrl: z.string().optional().nullable(),
  packagesJson: z.string().default("[]"),
  termsJson: z.string().default("[]"),
  contactJson: z.string().default("{}"),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const campaigns = await listAllCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await prisma.homeCampaign.create({ data: parsed.data });
  return NextResponse.json({ campaign: toCampaignDTO(row) });
}
