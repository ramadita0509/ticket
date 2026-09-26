export type CampaignFlightRow = {
  date: string;
  flightNo: string;
  route: string;
  depart: string;
  arrive: string;
  bookingClass?: string;
  note?: string;
};

export type CampaignPackage = {
  id: string;
  code: string;
  durationLabel: string;
  note?: string;
  flights: CampaignFlightRow[];
};

export type CampaignTerm = {
  id: string;
  icon: "deposit" | "clock" | "baggage" | "manifest" | "refund" | "child";
  label: string;
};

export type CampaignContact = {
  facebook?: string;
  instagram?: string;
  whatsapp?: string[];
  address?: string;
};

export type DestinationDeal = {
  id: string;
  city: string;
  country: string;
  imageUrl: string;
  priceFrom: number;
  currency?: string;
  legs: Array<{
    dateLabel: string;
    routeLabel: string;
    airline: string;
    direct?: boolean;
  }>;
  href?: string;
};

export type HomeCampaignDTO = {
  id: string;
  title: string;
  periodLabel: string;
  airlineName: string;
  partnerBanner: string | null;
  slogan: string | null;
  heroImageUrl: string | null;
  airlineLogoUrl: string | null;
  packages: CampaignPackage[];
  terms: CampaignTerm[];
  contact: CampaignContact;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type DestinationSectionDTO = {
  id: string;
  eyebrow: string;
  title: string;
  deals: DestinationDeal[];
  published: boolean;
  updatedAt: string;
};

export function parseCampaignJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
