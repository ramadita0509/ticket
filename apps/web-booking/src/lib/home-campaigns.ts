import { prisma } from "@/lib/db";
import {
  parseCampaignJson,
  type CampaignContact,
  type CampaignPackage,
  type CampaignTerm,
  type HomeCampaignDTO,
} from "@/lib/home-campaign-types";
import type { HomeCampaign } from "@prisma/client";

export function toCampaignDTO(row: HomeCampaign): HomeCampaignDTO {
  return {
    id: row.id,
    title: row.title,
    periodLabel: row.periodLabel,
    airlineName: row.airlineName,
    partnerBanner: row.partnerBanner,
    slogan: row.slogan,
    heroImageUrl: row.heroImageUrl,
    airlineLogoUrl: row.airlineLogoUrl,
    packages: parseCampaignJson<CampaignPackage[]>(row.packagesJson, []),
    terms: parseCampaignJson<CampaignTerm[]>(row.termsJson, []),
    contact: parseCampaignJson<CampaignContact>(row.contactJson, {}),
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPublishedCampaigns(): Promise<HomeCampaignDTO[]> {
  const rows = await prisma.homeCampaign.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toCampaignDTO);
}

export async function listAllCampaigns(): Promise<HomeCampaignDTO[]> {
  const rows = await prisma.homeCampaign.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toCampaignDTO);
}

export async function getCampaign(id: string): Promise<HomeCampaignDTO | null> {
  const row = await prisma.homeCampaign.findUnique({ where: { id } });
  return row ? toCampaignDTO(row) : null;
}
