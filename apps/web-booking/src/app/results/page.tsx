"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OfferCard } from "@/components/OfferCard";
import { SiteHeader } from "@/components/SiteHeader";
import type { FlightOffer, FlightSearchResult } from "@/lib/travelport/types";

type Stored = FlightSearchResult & {
  query?: {
    origin: string;
    destination: string;
    departureDate: string;
    adults: number;
  };
};

type SortKey = "price" | "duration" | "best";

function durationMinutes(offer: FlightOffer): number {
  const raw = offer.totalDuration || "";
  const h = Number(raw.match(/(\d+)j/)?.[1] ?? 0);
  const m = Number(raw.match(/(\d+)m/)?.[1] ?? 0);
  return h * 60 + m;
}

function formatDateId(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ResultsPage() {
  const [data, setData] = useState<Stored | null>(null);
  const [sort, setSort] = useState<SortKey>("best");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ticket:lastSearch");
      if (raw) setData(JSON.parse(raw) as Stored);
    } catch {
      setData(null);
    }
  }, []);

  const offers = useMemo(() => {
    const list = [...(data?.offers ?? [])];
    if (sort === "price") {
      list.sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    } else if (sort === "duration") {
      list.sort((a, b) => durationMinutes(a) - durationMinutes(b));
    } else {
      list.sort((a, b) => {
        const score = (o: FlightOffer) =>
          Number(o.price.amount) / 100_000 + durationMinutes(o) * 40;
        return score(a) - score(b);
      });
    }
    return list;
  }, [data?.offers, sort]);

  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader variant="solid" />

      <div className="border-b border-white/10 bg-brand-navy px-4 pb-5 pt-2 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div className="animate-fade-in">
            <Link
              href="/"
              className="mb-2 inline-block text-sm font-semibold text-white/65 transition hover:text-white"
            >
              ← Ubah pencarian
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {data?.query
                ? `${data.query.origin} → ${data.query.destination}`
                : "Hasil pencarian"}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {formatDateId(data?.query?.departureDate)}
              {data?.query?.adults
                ? ` · ${data.query.adults} dewasa`
                : ""}
              {` · ${offers.length} opsi`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["best", "Terbaik"],
                ["price", "Termurah"],
                ["duration", "Tercepat"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  sort === key
                    ? "bg-white text-brand-deep"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8">
        {!data ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
            <p className="text-muted">Belum ada hasil pencarian.</p>
            <Link
              href="/"
              className="mt-4 inline-block font-extrabold text-brand"
            >
              Cari penerbangan →
            </Link>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center text-muted">
            Tidak ada penerbangan untuk kriteria ini.
          </div>
        ) : (
          offers.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} index={i} />
          ))
        )}
      </div>
    </main>
  );
}
