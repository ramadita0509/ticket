import type { CampaignContact } from "@/lib/home-campaign-types";

/** Default El Wafa contact shown in footer when campaign contact is missing */
export const DEFAULT_SITE_CONTACT: Required<
  Pick<CampaignContact, "facebook" | "instagram" | "address">
> & { whatsapp: string[] } = {
  facebook: "ElWafa Travel",
  instagram: "@ElWafa Travel",
  whatsapp: ["0822 9750 1259", "0857 7214 8365"],
  address: "Citra Indah City CF 09/10 Jonggol Bogor",
};

export function resolveSiteContact(
  contact?: CampaignContact | null
): {
  facebook: string;
  instagram: string;
  whatsapp: string[];
  address: string;
} {
  return {
    facebook: contact?.facebook?.trim() || DEFAULT_SITE_CONTACT.facebook,
    instagram: contact?.instagram?.trim() || DEFAULT_SITE_CONTACT.instagram,
    whatsapp:
      contact?.whatsapp?.filter(Boolean).length
        ? contact.whatsapp.filter(Boolean)
        : DEFAULT_SITE_CONTACT.whatsapp,
    address: contact?.address?.trim() || DEFAULT_SITE_CONTACT.address,
  };
}
