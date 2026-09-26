import type { AirportSuggestion } from "@ticket/shared";

/** Common Indonesian + regional hubs for offline autocomplete fallback */
export const STATIC_AIRPORTS: AirportSuggestion[] = [
  { iataCode: "CGK", name: "Soekarno-Hatta International", cityName: "Jakarta", countryCode: "ID", type: "airport" },
  { iataCode: "HLP", name: "Halim Perdanakusuma", cityName: "Jakarta", countryCode: "ID", type: "airport" },
  { iataCode: "DPS", name: "Ngurah Rai International", cityName: "Denpasar", countryCode: "ID", type: "airport" },
  { iataCode: "SUB", name: "Juanda International", cityName: "Surabaya", countryCode: "ID", type: "airport" },
  { iataCode: "YIA", name: "Yogyakarta International", cityName: "Yogyakarta", countryCode: "ID", type: "airport" },
  { iataCode: "JOG", name: "Adisutjipto", cityName: "Yogyakarta", countryCode: "ID", type: "airport" },
  { iataCode: "SRG", name: "Ahmad Yani", cityName: "Semarang", countryCode: "ID", type: "airport" },
  { iataCode: "BDO", name: "Husein Sastranegara", cityName: "Bandung", countryCode: "ID", type: "airport" },
  { iataCode: "MDN", name: "Kualanamu International", cityName: "Medan", countryCode: "ID", type: "airport" },
  { iataCode: "KNO", name: "Kualanamu International", cityName: "Medan", countryCode: "ID", type: "airport" },
  { iataCode: "PLM", name: "Sultan Mahmud Badaruddin II", cityName: "Palembang", countryCode: "ID", type: "airport" },
  { iataCode: "PKU", name: "Sultan Syarif Kasim II", cityName: "Pekanbaru", countryCode: "ID", type: "airport" },
  { iataCode: "BPN", name: "Sultan Aji Muhammad Sulaiman", cityName: "Balikpapan", countryCode: "ID", type: "airport" },
  { iataCode: "UPG", name: "Sultan Hasanuddin", cityName: "Makassar", countryCode: "ID", type: "airport" },
  { iataCode: "MDC", name: "Sam Ratulangi", cityName: "Manado", countryCode: "ID", type: "airport" },
  { iataCode: "LOP", name: "Zainuddin Abdul Madjid", cityName: "Lombok", countryCode: "ID", type: "airport" },
  { iataCode: "BTJ", name: "Sultan Iskandar Muda", cityName: "Banda Aceh", countryCode: "ID", type: "airport" },
  { iataCode: "PNK", name: "Supadio", cityName: "Pontianak", countryCode: "ID", type: "airport" },
  { iataCode: "SIN", name: "Changi", cityName: "Singapore", countryCode: "SG", type: "airport" },
  { iataCode: "KUL", name: "Kuala Lumpur International", cityName: "Kuala Lumpur", countryCode: "MY", type: "airport" },
  { iataCode: "BKK", name: "Suvarnabhumi", cityName: "Bangkok", countryCode: "TH", type: "airport" },
  { iataCode: "HKG", name: "Hong Kong International", cityName: "Hong Kong", countryCode: "HK", type: "airport" },
  { iataCode: "NRT", name: "Narita International", cityName: "Tokyo", countryCode: "JP", type: "airport" },
  { iataCode: "HND", name: "Haneda", cityName: "Tokyo", countryCode: "JP", type: "airport" },
  { iataCode: "ICN", name: "Incheon International", cityName: "Seoul", countryCode: "KR", type: "airport" },
  { iataCode: "SYD", name: "Sydney Kingsford Smith", cityName: "Sydney", countryCode: "AU", type: "airport" },
  { iataCode: "MEL", name: "Melbourne", cityName: "Melbourne", countryCode: "AU", type: "airport" },
  { iataCode: "DXB", name: "Dubai International", cityName: "Dubai", countryCode: "AE", type: "airport" },
  { iataCode: "DOH", name: "Hamad International", cityName: "Doha", countryCode: "QA", type: "airport" },
  { iataCode: "LHR", name: "Heathrow", cityName: "London", countryCode: "GB", type: "airport" },
];

export function filterStaticAirports(query: string): AirportSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return STATIC_AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.cityName?.toLowerCase().includes(q) ?? false)
  ).slice(0, 10);
}
