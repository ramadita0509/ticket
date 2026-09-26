import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleDeals = [
  {
    id: "d1",
    city: "Jeddah",
    country: "Arab Saudi",
    imageUrl:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
    priceFrom: 8500000,
    legs: [
      {
        dateLabel: "Sab, 10 Jan",
        routeLabel: "CGK - JED dengan Etihad",
        airline: "Etihad",
        direct: false,
      },
      {
        dateLabel: "Sel, 20 Jan",
        routeLabel: "JED - CGK dengan Etihad",
        airline: "Etihad",
        direct: false,
      },
    ],
    href: "/?origin=CGK&destination=JED",
  },
  {
    id: "d3",
    city: "Dubai",
    country: "UEA",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    priceFrom: 4850000,
    legs: [
      {
        dateLabel: "Kam, 8 Jan",
        routeLabel: "CGK - DXB dengan Emirates",
        airline: "Emirates",
        direct: true,
      },
      {
        dateLabel: "Sen, 15 Jan",
        routeLabel: "DXB - CGK dengan Emirates",
        airline: "Emirates",
        direct: true,
      },
    ],
  },
  {
    id: "d5",
    city: "Kuala Lumpur",
    country: "Malaysia",
    imageUrl:
      "https://images.unsplash.com/photo-1596422846543-75c6fc764821?auto=format&fit=crop&w=800&q=80",
    priceFrom: 1725000,
    legs: [
      {
        dateLabel: "Sab, 24 Okt",
        routeLabel: "CGK - KUL dengan AirAsia",
        airline: "AirAsia",
        direct: true,
      },
      {
        dateLabel: "Sel, 28 Okt",
        routeLabel: "KUL - CGK dengan AirAsia",
        airline: "AirAsia",
        direct: true,
      },
    ],
  },
  {
    id: "d6",
    city: "Singapura",
    country: "Singapura",
    imageUrl:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    priceFrom: 1450000,
    legs: [
      {
        dateLabel: "Sab, 7 Nov",
        routeLabel: "CGK - SIN dengan Scoot",
        airline: "Scoot",
        direct: true,
      },
      {
        dateLabel: "Sen, 10 Nov",
        routeLabel: "SIN - CGK dengan Scoot",
        airline: "Scoot",
        direct: true,
      },
    ],
  },
];

const campaigns = [
  {
    title: "Tiket UMROH",
    periodLabel: "1448H / 2027M",
    airlineName: "Etihad Airways",
    partnerBanner: "Terbang Bersama Etihad Airways",
    slogan: "Ibadah Nyaman, Perjalanan Berkah",
    heroImageUrl:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1600&q=80",
    airlineLogoUrl: null,
    packagesJson: JSON.stringify([
      {
        id: "p1",
        code: "HK40",
        durationLabel: "12D",
        flights: [
          { date: "09 Jan", flightNo: "EY0475", route: "CGK → AUH", depart: "18:00", arrive: "23:05" },
          { date: "10 Jan", flightNo: "EY0316", route: "AUH → JED", depart: "02:05", arrive: "04:30" },
          { date: "20 Jan", flightNo: "EY0317", route: "JED → AUH", depart: "06:00", arrive: "09:35" },
          { date: "20 Jan", flightNo: "EY0474", route: "AUH → CGK", depart: "21:15", arrive: "09:55+1" },
        ],
      },
      {
        id: "p2",
        code: "HK40",
        durationLabel: "10D",
        note: "STOP AKHIR AUH 2D1N",
        flights: [
          { date: "12 Jan", flightNo: "EY0475", route: "CGK → AUH", depart: "18:00", arrive: "23:05" },
          { date: "13 Jan", flightNo: "EY0316", route: "AUH → MED", depart: "02:05", arrive: "04:20" },
          { date: "20 Jan", flightNo: "EY0315", route: "JED → AUH", depart: "11:20", arrive: "15:00" },
          { date: "21 Jan", flightNo: "EY0474", route: "AUH → CGK", depart: "21:15", arrive: "09:55+1" },
        ],
      },
      {
        id: "p3",
        code: "HK40",
        durationLabel: "12D",
        flights: [
          { date: "16 Jan", flightNo: "EY0475", route: "CGK → AUH", depart: "18:00", arrive: "23:05" },
          { date: "17 Jan", flightNo: "EY0316", route: "AUH → JED", depart: "02:05", arrive: "04:30" },
          { date: "27 Jan", flightNo: "EY0317", route: "JED → AUH", depart: "06:00", arrive: "09:35" },
          { date: "27 Jan", flightNo: "EY0474", route: "AUH → CGK", depart: "21:15", arrive: "09:55+1" },
        ],
      },
    ]),
    termsJson: JSON.stringify([
      { id: "t1", icon: "deposit", label: "Deposit: 25%" },
      { id: "t2", icon: "clock", label: "Timelimit Full Payment & Issued: H-30 DOT" },
      { id: "t3", icon: "baggage", label: "Bagasi: 30 Kg" },
      { id: "t4", icon: "manifest", label: "Materilisasi: 80%" },
      { id: "t5", icon: "refund", label: "Ticket & Payment Non Refundable" },
      { id: "t6", icon: "child", label: "No Child fare" },
    ]),
    contactJson: JSON.stringify({
      facebook: "ElWafa Travel",
      instagram: "@ElWafa Travel",
      whatsapp: ["0822 9750 1259", "0857 7214 8365"],
      address: "Citra Indah City CF 09/10 Jonggol Bogor",
    }),
    published: true,
    sortOrder: 0,
  },
  {
    title: "Tiket UMROH",
    periodLabel: "Januari 2027",
    airlineName: "Emirates",
    partnerBanner: "Terbang Bersama Emirates",
    slogan: "Ibadah Nyaman, Perjalanan Berkah",
    heroImageUrl:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80",
    airlineLogoUrl: null,
    packagesJson: JSON.stringify([
      {
        id: "e1",
        code: "JEDJED",
        durationLabel: "12D",
        flights: [
          { date: "13JAN", flightNo: "EK359", route: "CGK → DXB", depart: "00:15", arrive: "05:30", bookingClass: "KK45" },
          { date: "13JAN", flightNo: "EK805", route: "DXB → JED", depart: "08:00", arrive: "10:15", bookingClass: "KK45" },
          { date: "24JAN", flightNo: "EK806", route: "JED → DXB", depart: "12:00", arrive: "15:25", bookingClass: "KK45" },
          { date: "24JAN", flightNo: "EK358", route: "DXB → CGK", depart: "21:40", arrive: "09:10+1", bookingClass: "KK45" },
        ],
      },
      {
        id: "e2",
        code: "JEDJED",
        durationLabel: "9D",
        flights: [
          { date: "16JAN", flightNo: "EK359", route: "CGK → DXB", depart: "00:15", arrive: "05:30", bookingClass: "HK45" },
          { date: "16JAN", flightNo: "EK805", route: "DXB → JED", depart: "08:00", arrive: "10:15", bookingClass: "HK45" },
          { date: "24JAN", flightNo: "EK806", route: "JED → DXB", depart: "12:00", arrive: "15:25", bookingClass: "HK45" },
          { date: "24JAN", flightNo: "EK358", route: "DXB → CGK", depart: "21:40", arrive: "09:10+1", bookingClass: "HK45" },
        ],
      },
    ]),
    termsJson: JSON.stringify([
      { id: "t1", icon: "deposit", label: "Deposit: 25%" },
      { id: "t2", icon: "clock", label: "Timelimit Full Payment & Issued: H-30 DOT" },
      { id: "t3", icon: "baggage", label: "Bagasi: 30 Kg" },
      { id: "t4", icon: "manifest", label: "Materilisasi: 80%" },
      { id: "t5", icon: "refund", label: "Ticket & Payment Non Refundable" },
      { id: "t6", icon: "child", label: "No Child fare" },
    ]),
    contactJson: JSON.stringify({
      facebook: "ElWafa Travel",
      instagram: "@ElWafa Travel",
      whatsapp: ["0822 9750 1259", "0857 7214 8365"],
      address: "Citra Indah City CF 09/10 Jonggol Bogor",
    }),
    published: true,
    sortOrder: 1,
  },
];

async function main() {
  const dest = await prisma.homeDestinationSection.findUnique({
    where: { id: "home-destinations" },
  });
  if (!dest) {
    await prisma.homeDestinationSection.create({
      data: {
        id: "home-destinations",
        eyebrow: "Destinasi populer",
        title: "Penawaran siap berangkat",
        dealsJson: JSON.stringify(sampleDeals),
        published: true,
      },
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
  for (const c of campaigns) {
    await prisma.homeCampaign.create({ data: c });
  }
  console.log(`Seeded ${campaigns.length} home campaigns.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
