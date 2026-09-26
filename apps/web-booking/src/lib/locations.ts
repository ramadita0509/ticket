import { AIRPORT_ROWS } from "./airport-catalog";

export type LocationType = "country" | "city" | "airport";

export type LocationSuggestion = {
  id: string;
  type: LocationType;
  /** Shown in parentheses — IATA / ISO country */
  code: string;
  /** 3-letter code sent to flight search */
  searchCode: string;
  name: string;
  /** Secondary line, e.g. country name */
  subtitle: string;
  countryCode: string;
  keywords?: string[];
};

function city(
  name: string,
  code: string,
  countryCode: string,
  subtitle: string,
  keywords?: string[],
  searchCode?: string
): LocationSuggestion {
  return {
    id: `city-${code}-${name}`.toLowerCase().replace(/\s+/g, "-"),
    type: "city",
    code,
    searchCode: searchCode ?? code,
    name,
    subtitle,
    countryCode,
    keywords,
  };
}

function airport(
  name: string,
  code: string,
  cityName: string,
  countryCode: string,
  countryName: string,
  keywords?: string[]
): LocationSuggestion {
  return {
    id: `airport-${code}`,
    type: "airport",
    code,
    searchCode: code,
    name: `${name} (${code})`,
    subtitle: `${cityName}, ${countryName}`,
    countryCode,
    keywords,
  };
}

function country(
  id: string,
  code: string,
  searchCode: string,
  name: string,
  subtitle: string,
  keywords?: string[]
): LocationSuggestion {
  return {
    id,
    type: "country",
    code,
    searchCode,
    name,
    subtitle,
    countryCode: code,
    keywords,
  };
}

const COUNTRIES: LocationSuggestion[] = [
  country("country-id", "ID", "CGK", "Indonesia", "Indonesia", ["indonesia", "idn"]),
  country("country-eg", "EG", "CAI", "Mesir", "Mesir", ["egypt", "mesir", "cairo"]),
  country("country-sa", "SA", "JED", "Arab Saudi", "Arab Saudi", ["saudi", "ksa", "arabia"]),
  country("country-ae", "AE", "DXB", "Uni Emirat Arab", "UEA", ["uae", "emirates", "dubai"]),
  country("country-qa", "QA", "DOH", "Qatar", "Qatar"),
  country("country-bh", "BH", "BAH", "Bahrain", "Bahrain"),
  country("country-kw", "KW", "KWI", "Kuwait", "Kuwait"),
  country("country-om", "OM", "MCT", "Oman", "Oman"),
  country("country-jo", "JO", "AMM", "Yordania", "Yordania", ["jordan"]),
  country("country-lb", "LB", "BEY", "Lebanon", "Lebanon", ["beirut"]),
  country("country-tr", "TR", "IST", "Turki", "Turki", ["turkey", "turkiye"]),
  country("country-sg", "SG", "SIN", "Singapura", "Singapura", ["singapore"]),
  country("country-my", "MY", "KUL", "Malaysia", "Malaysia"),
  country("country-th", "TH", "BKK", "Thailand", "Thailand"),
  country("country-vn", "VN", "SGN", "Vietnam", "Vietnam"),
  country("country-ph", "PH", "MNL", "Filipina", "Filipina", ["philippines"]),
  country("country-jp", "JP", "NRT", "Jepang", "Jepang", ["japan"]),
  country("country-kr", "KR", "ICN", "Korea Selatan", "Korea Selatan", ["korea", "south korea"]),
  country("country-cn", "CN", "PEK", "China", "China", ["prc"]),
  country("country-hk", "HK", "HKG", "Hong Kong", "Hong Kong"),
  country("country-tw", "TW", "TPE", "Taiwan", "Taiwan"),
  country("country-in", "IN", "DEL", "India", "India"),
  country("country-pk", "PK", "LHE", "Pakistan", "Pakistan"),
  country("country-bd", "BD", "DAC", "Bangladesh", "Bangladesh"),
  country("country-au", "AU", "SYD", "Australia", "Australia"),
  country("country-nz", "NZ", "AKL", "Selandia Baru", "Selandia Baru", ["new zealand"]),
  country("country-gb", "GB", "LHR", "Inggris", "Britania Raya", ["uk", "united kingdom", "england"]),
  country("country-fr", "FR", "CDG", "Prancis", "Prancis", ["france"]),
  country("country-de", "DE", "FRA", "Jerman", "Jerman", ["germany"]),
  country("country-nl", "NL", "AMS", "Belanda", "Belanda", ["netherlands", "holland"]),
  country("country-it", "IT", "FCO", "Italia", "Italia", ["italy"]),
  country("country-es", "ES", "MAD", "Spanyol", "Spanyol", ["spain"]),
  country("country-us", "US", "JFK", "Amerika Serikat", "AS", ["usa", "america", "united states"]),
  country("country-ca", "CA", "YYZ", "Kanada", "Kanada", ["canada"]),
  country("country-br", "BR", "GRU", "Brasil", "Brasil", ["brazil"]),
  country("country-za", "ZA", "JNB", "Afrika Selatan", "Afrika Selatan", ["south africa"]),
  country("country-ma", "MA", "CMN", "Maroko", "Maroko", ["morocco"]),
  country("country-ke", "KE", "NBO", "Kenya", "Kenya"),
  country("country-et", "ET", "ADD", "Ethiopia", "Ethiopia"),
  country("country-mv", "MV", "MLE", "Maldives", "Maldives", ["maldives", "male"]),
  country("country-lk", "LK", "CMB", "Sri Lanka", "Sri Lanka"),
];

/** Extra city aliases (metro / common search names) beyond airport city names */
const EXTRA_CITIES: LocationSuggestion[] = [
  city("Jakarta", "CGK", "ID", "Indonesia", ["jkt"]),
  city("Denpasar / Bali", "DPS", "ID", "Indonesia", ["bali"]),
  city("Yogyakarta", "YIA", "ID", "Indonesia", ["jogja", "yogya"]),
  city("Mekkah / Jeddah", "JED", "SA", "Arab Saudi", ["mecca", "makkah"]),
  city("Cairo", "CAI", "EG", "Mesir", ["kairo", "egypt"]),
  city("Alexandria", "HBE", "EG", "Mesir", ["iskandariyah"]),
  city("Tokyo", "TYO", "JP", "Jepang", ["tokyo"], "NRT"),
  city("Osaka", "OSA", "JP", "Jepang", undefined, "KIX"),
  city("London", "LON", "GB", "Inggris", undefined, "LHR"),
  city("Paris", "PAR", "FR", "Prancis", undefined, "CDG"),
  city("New York", "NYC", "US", "Amerika Serikat", ["nyc"], "JFK"),
  city("Seoul", "SEL", "KR", "Korea Selatan", undefined, "ICN"),
  city("Roma", "ROM", "IT", "Italia", ["rome"], "FCO"),
  city("Istanbul (Mana saja)", "IST", "TR", "Turki", ["anywhere"]),
  city("Ho Chi Minh / Saigon", "SGN", "VN", "Vietnam", ["saigon"]),
];

function buildFromCatalog(): LocationSuggestion[] {
  const airports: LocationSuggestion[] = [];
  const catalogCities: LocationSuggestion[] = [];
  const occupiedKeys = new Set<string>();
  const occupiedIds = new Set<string>();

  // Prefer EXTRA_CITIES aliases — skip auto-generated duplicates
  for (const c of EXTRA_CITIES) {
    occupiedKeys.add(`${c.countryCode}:${c.name.toLowerCase()}`);
    occupiedIds.add(c.id);
  }

  for (const [name, iata, cityName, countryCode, countryName, keywords] of AIRPORT_ROWS) {
    airports.push(airport(name, iata, cityName, countryCode, countryName, keywords));

    const key = `${countryCode}:${cityName.toLowerCase()}`;
    const candidate = city(cityName, iata, countryCode, countryName, keywords);
    if (occupiedKeys.has(key) || occupiedIds.has(candidate.id)) continue;
    occupiedKeys.add(key);
    occupiedIds.add(candidate.id);
    catalogCities.push(candidate);
  }

  return [...COUNTRIES, ...EXTRA_CITIES, ...catalogCities, ...airports];
}

/** Static catalog for autocomplete (mock-friendly; swap for Travelport Reference later) */
export const LOCATIONS: LocationSuggestion[] = buildFromCatalog();

function scoreMatch(loc: LocationSuggestion, q: string): number {
  const code = loc.code.toLowerCase();
  const search = loc.searchCode.toLowerCase();
  const name = loc.name.toLowerCase();
  const sub = loc.subtitle.toLowerCase();
  const keys = (loc.keywords ?? []).map((k) => k.toLowerCase());

  if (code === q || search === q) return 100;
  if (code.startsWith(q) || search.startsWith(q)) return 90;
  if (name.startsWith(q)) return 80;
  if (keys.some((k) => k === q || k.startsWith(q))) return 75;
  if (name.includes(q)) return 60;
  if (sub.includes(q) || keys.some((k) => k.includes(q))) return 40;
  if (code.includes(q) || search.includes(q)) return 30;
  return 0;
}

const TYPE_RANK: Record<LocationType, number> = {
  country: 3,
  city: 2,
  airport: 1,
};

export function suggestLocations(
  query: string,
  limit = 12
): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return LOCATIONS.filter((l) =>
      [
        "country-id",
        "city-cgk-jakarta",
        "airport-cgk",  
        "airport-dps",
        "airport-sub",
        "airport-jed",
        "airport-cai",
        "airport-dxb",
        "airport-sin",
        "airport-kul",
      ].includes(l.id)
    ).slice(0, limit);
  }

  return LOCATIONS.map((loc) => ({ loc, score: scoreMatch(loc, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return TYPE_RANK[b.loc.type] - TYPE_RANK[a.loc.type];
    })
    .slice(0, limit)
    .map((x) => x.loc);
}

export function findLocationBySearchCode(
  code: string
): LocationSuggestion | undefined {
  const c = code.trim().toUpperCase();
  return (
    LOCATIONS.find((l) => l.type === "airport" && l.searchCode === c) ??
    LOCATIONS.find((l) => l.searchCode === c)
  );
}

/** Full label with code — for lists / accessibility */
export function formatLocationLabel(loc: LocationSuggestion): string {
  if (loc.type === "airport") {
    return loc.name.includes("(") ? loc.name : `${loc.name} (${loc.code})`;
  }
  return `${loc.name} (${loc.code})`;
}

/** Compact label for the search input (no code suffix) */
export function shortLocationLabel(loc: LocationSuggestion): string {
  if (loc.type === "airport") {
    return loc.name.replace(/\s*\([A-Z0-9]{3}\)\s*$/i, "").trim();
  }
  return loc.name;
}

export function typeLabel(type: LocationType): string {
  if (type === "country") return "Negara";
  if (type === "city") return "Kota";
  return "Bandara";
}
