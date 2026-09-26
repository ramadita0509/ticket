import Constants from "expo-constants";
import type {
  AirportSuggestion,
  FlightOffer,
  FlightSearchResponse,
} from "@ticket/shared";
import { Platform } from "react-native";

function resolveApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // Android emulator reaches host via 10.0.2.2
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8787";
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri ??
    "";
  const host = hostUri.split(":")[0];
  if (host && host !== "exp" && !host.includes("localhost")) {
    return `http://${host}:8787`;
  }

  return "http://localhost:8787";
}

export const API_BASE = resolveApiBase();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : data?.error
          ? JSON.stringify(data.error)
          : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function suggestAirports(
  q: string
): Promise<AirportSuggestion[]> {
  if (!q.trim()) return [];
  const data = await request<{ suggestions: AirportSuggestion[] }>(
    `/airports/suggest?q=${encodeURIComponent(q.trim())}`
  );
  return data.suggestions;
}

export async function searchFlights(input: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}): Promise<FlightSearchResponse & { demo?: boolean }> {
  return request("/flights/search", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOffer(id: string): Promise<FlightOffer> {
  const data = await request<{ offer: FlightOffer }>(
    `/flights/offers/${encodeURIComponent(id)}`
  );
  return data.offer;
}

export function formatMoney(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16) || iso;
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
