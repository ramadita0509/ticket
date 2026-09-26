import { prisma } from "@/lib/db";
import {
  parseCampaignJson,
  type DestinationDeal,
  type DestinationSectionDTO,
} from "@/lib/home-campaign-types";
import type { HomeDestinationSection } from "@prisma/client";

export const DESTINATION_SECTION_ID = "home-destinations";

export function toDestinationSectionDTO(
  row: HomeDestinationSection
): DestinationSectionDTO {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    deals: parseCampaignJson<DestinationDeal[]>(row.dealsJson, []),
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getPublishedDestinationSection(): Promise<DestinationSectionDTO | null> {
  const row = await prisma.homeDestinationSection.findUnique({
    where: { id: DESTINATION_SECTION_ID },
  });
  if (!row || !row.published) return null;
  return toDestinationSectionDTO(row);
}

export async function getOrCreateDestinationSection(): Promise<DestinationSectionDTO> {
  const existing = await prisma.homeDestinationSection.findUnique({
    where: { id: DESTINATION_SECTION_ID },
  });
  if (existing) return toDestinationSectionDTO(existing);

  const row = await prisma.homeDestinationSection.create({
    data: {
      id: DESTINATION_SECTION_ID,
      eyebrow: "Destinasi populer",
      title: "Penawaran siap berangkat",
      dealsJson: "[]",
      published: true,
    },
  });
  return toDestinationSectionDTO(row);
}
