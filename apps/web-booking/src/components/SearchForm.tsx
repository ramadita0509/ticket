"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LocationField } from "@/components/LocationField";
import {
  findLocationBySearchCode,
  shortLocationLabel,
  type LocationSuggestion,
} from "@/lib/locations";

function defaultDate(offset = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function initialLabel(code: string): string {
  const loc = findLocationBySearchCode(code);
  return loc ? shortLocationLabel(loc) : code;
}

export function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState("CGK");
  const [destination, setDestination] = useState("JED");
  const [originLabel, setOriginLabel] = useState(() => initialLabel("CGK"));
  const [destinationLabel, setDestinationLabel] = useState(() =>
    initialLabel("JED")
  );
  const [departureDate, setDepartureDate] = useState(defaultDate(14));
  const [returnDate, setReturnDate] = useState(defaultDate(21));
  const [adults, setAdults] = useState(1);
  const [roundTrip, setRoundTrip] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => {
    return (
      /^[A-Z]{3}$/.test(origin) &&
      /^[A-Z]{3}$/.test(destination) &&
      origin !== destination &&
      /^\d{4}-\d{2}-\d{2}$/.test(departureDate) &&
      adults >= 1
    );
  }, [adults, departureDate, destination, origin]);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
    setOriginLabel(destinationLabel);
    setDestinationLabel(originLabel);
  }

  function selectOrigin(loc: LocationSuggestion) {
    setOrigin(loc.searchCode);
    setOriginLabel(shortLocationLabel(loc));
  }

  function selectDestination(loc: LocationSuggestion) {
    setDestination(loc.searchCode);
    setDestinationLabel(shortLocationLabel(loc));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSearch || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate: roundTrip ? returnDate : undefined,
          adults,
          currencyCode: "IDR",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Gagal mencari penerbangan"
        );
      }
      sessionStorage.setItem(
        "ticket:lastSearch",
        JSON.stringify({
          ...data,
          query: {
            origin,
            destination,
            originLabel,
            destinationLabel,
            departureDate,
            returnDate: roundTrip ? returnDate : undefined,
            adults,
          },
        })
      );
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative z-10 w-full overflow-visible rounded-2xl border border-white/15 bg-brand-navy/90 p-4 shadow-[0_24px_80px_rgba(2,24,46,0.45)] backdrop-blur-md sm:p-5"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <TripToggle
          active={roundTrip}
          onClick={() => setRoundTrip(true)}
          label="Pulang-pergi"
        />
        <TripToggle
          active={!roundTrip}
          onClick={() => setRoundTrip(false)}
          label="Sekali jalan"
        />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="relative z-20 grid min-w-0 flex-1 gap-3 overflow-visible sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <LocationField
            label="Dari"
            valueCode={origin}
            displayValue={originLabel}
            onSelect={selectOrigin}
            onDisplayChange={setOriginLabel}
            onClearCode={() => setOrigin("")}
            menuAlign="start"
          />

          <div className="flex items-end justify-center pb-1">
            <button
              type="button"
              onClick={swap}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white text-brand-deep shadow-md transition hover:scale-105 hover:border-brand hover:shadow-lg"
              aria-label="Tukar asal dan tujuan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M7 8h11M15 5l3 3-3 3M17 16H6M9 13l-3 3 3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <LocationField
            label="Ke"
            valueCode={destination}
            displayValue={destinationLabel}
            onSelect={selectDestination}
            onDisplayChange={setDestinationLabel}
            onClearCode={() => setDestination("")}
            menuAlign="end"
          />
        </div>

        <div
          className={`grid shrink-0 gap-3 sm:grid-cols-2 ${
            roundTrip ? "xl:grid-cols-[9.5rem_9.5rem_5.5rem_auto]" : "xl:grid-cols-[10.5rem_5.5rem_auto]"
          }`}
        >
          <Field label="Berangkat">
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="field-input"
            />
          </Field>

          {roundTrip ? (
            <Field label="Pulang">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="field-input"
              />
            </Field>
          ) : null}

          <Field label="Penumpang">
            <input
              type="number"
              min={1}
              max={9}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value) || 1)}
              className="field-input"
            />
          </Field>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canSearch || loading}
              className="h-[52px] w-full shrink-0 rounded-xl bg-brand px-7 text-base font-extrabold text-white shadow-lg shadow-brand/35 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 xl:min-w-[120px]"
            >
              {loading ? "Mencari…" : "Cari"}
            </button>
          </div>
        </div>
      </div>

      {!canSearch && (originLabel || destinationLabel) ? (
        <p className="mt-3 text-xs text-white/55">
          Pilih lokasi dari daftar saran (negara / kota / bandara) agar kode
          pencarian terisi.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function TripToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-white/80 bg-white/15 text-white"
          : "border-white/25 text-white/65 hover:border-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block font-medium text-white/75">{label}</span>
      {children}
    </label>
  );
}
