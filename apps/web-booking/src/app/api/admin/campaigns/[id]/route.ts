import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { toCampaignDTO } from "@/lib/home-campaigns";

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  periodLabel: z.string().min(1).optional(),
  airlineName: z.string().min(1).optional(),
  partnerBanner: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  airlineLogoUrl: z.string().optional().nullable(),
  packagesJson: z.string().optional(),
  termsJson: z.string().optional(),
  contactJson: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const row = await prisma.homeCampaign.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign: toCampaignDTO(row) });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const row = await prisma.homeCampaign.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ campaign: toCampaignDTO(row) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.homeCampaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
