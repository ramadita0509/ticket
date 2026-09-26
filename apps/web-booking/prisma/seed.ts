import { PrismaClient } from "@prisma/client";
import {
  SEED_CAMPAIGNS,
  SEED_DESTINATION_SECTION,
} from "../src/lib/home-campaign-seed";

const prisma = new PrismaClient();

async function main() {
  const dest = await prisma.homeDestinationSection.findUnique({
    where: { id: SEED_DESTINATION_SECTION.id },
  });
  if (!dest) {
    await prisma.homeDestinationSection.create({
      data: SEED_DESTINATION_SECTION,
    });
    console.log("Seeded destination section.");
  } else {
    console.log("Destination section already exists; skip.");
  }

  const count = await prisma.homeCampaign.count();
  if (count > 0) {
    console.log(`HomeCampaign already has ${count} row(s); skip seed.`);
    return;
  }
  for (const c of SEED_CAMPAIGNS) {
    await prisma.homeCampaign.create({ data: c });
  }
  console.log(`Seeded ${SEED_CAMPAIGNS.length} home campaigns.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
