import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  DESTINATION_SECTION_ID,
  getOrCreateDestinationSection,
  toDestinationSectionDTO,
} from "@/lib/home-destinations";

const bodySchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  dealsJson: z.string(),
  published: z.boolean(),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const section = await getOrCreateDestinationSection();
  return NextResponse.json({ section });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    JSON.parse(parsed.data.dealsJson);
  } catch {
    return NextResponse.json({ error: "dealsJson harus JSON valid" }, { status: 400 });
  }

  const row = await prisma.homeDestinationSection.upsert({
    where: { id: DESTINATION_SECTION_ID },
    create: {
      id: DESTINATION_SECTION_ID,
      ...parsed.data,
    },
    update: parsed.data,
  });
  return NextResponse.json({ section: toDestinationSectionDTO(row) });
}
