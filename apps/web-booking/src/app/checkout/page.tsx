"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { formatMoney } from "@/lib/money";
import type { PricedOffer } from "@/lib/travelport/booking-types";

type PassengerForm = {
  title: "Mr" | "Mrs" | "Ms";
  firstName: string;
  lastName: string;
  type: "ADULT";
  idNumber: string;
};

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const offerId = params.get("offerId") ?? "";

  const [priced, setPriced] = useState<PricedOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passenger, setPassenger] = useState<PassengerForm>({
    title: "Mr",
    firstName: "",
    lastName: "",
    type: "ADULT",
    idNumber: "",
  });

  useEffect(() => {
    if (!offerId) {
      setLoading(false);
      setError("Offer tidak ditemukan. Cari penerbangan dulu.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/flights/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal konfirmasi harga");
        if (!cancelled) setPriced(data.priced as PricedOffer);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal konfirmasi harga");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [offerId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!priced || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: priced.offer.id,
          contactEmail: email,
          contactPhone: phone || undefined,
          passengers: [
            {
              ...passenger,
              idNumber: passenger.idNumber || undefined,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Gagal membuat booking"
        );
      }
      router.push(`/booking/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat booking");
      setSubmitting(false);
    }
  }

  const first = priced?.offer.segments[0];
  const last = priced?.offer.segments[priced.offer.segments.length - 1];

  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader variant="solid" />

      <div className="border-b border-white/10 bg-brand-navy px-4 pb-6 pt-2 text-white">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <Link
            href="/results"
            className="mb-2 inline-block text-sm font-semibold text-white/65 transition hover:text-white"
          >
            ← Kembali ke hasil
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-white/70">
            Konfirmasi tarif, isi penumpang, lalu bayar
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        {loading ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center text-muted">
            Mengonfirmasi harga…
          </div>
        ) : error && !priced ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
            <p className="text-muted">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block font-extrabold text-brand"
            >
              Cari lagi →
            </Link>
          </div>
        ) : priced ? (
          <>
            <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(12,27,42,0.04)]">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Penerbangan
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink">
                {first?.from} → {last?.to}
              </p>
              <p className="mt-1 text-sm text-muted">
                {priced.offer.airline} · {priced.offer.totalDuration} ·{" "}
                {priced.offer.stops === 0
                  ? "Langsung"
                  : `${priced.offer.stops} stop`}
              </p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                {priced.offer.segments.map((s) => (
                  <li key={`${s.flightNumber}-${s.departAt}`} className="flex justify-between gap-3">
                    <span className="font-semibold text-ink">
                      {s.flightNumber}
                    </span>
                    <span className="text-muted">
                      {s.from} {s.departAt.slice(11, 16)} → {s.to}{" "}
                      {s.arriveAt.slice(11, 16)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="animate-fade-up-delay rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Rincian tarif
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Dasar</dt>
                  <dd className="font-semibold">
                    {formatMoney(
                      priced.fare.base.amount,
                      priced.fare.base.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Pajak</dt>
                  <dd className="font-semibold">
                    {formatMoney(
                      priced.fare.taxes.amount,
                      priced.fare.taxes.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Biaya</dt>
                  <dd className="font-semibold">
                    {formatMoney(
                      priced.fare.fees.amount,
                      priced.fare.fees.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-extrabold text-ink">Total</dt>
                  <dd className="font-extrabold text-price">
                    {formatMoney(
                      priced.fare.total.amount,
                      priced.fare.total.currency
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">
                Tarif berlaku sampai{" "}
                {new Date(priced.expiresAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </section>

            <form
              onSubmit={onSubmit}
              className="animate-fade-up-late space-y-4 rounded-2xl border border-line bg-surface p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Penumpang & kontak
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-muted">
                    Title
                  </span>
                  <select
                    className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                    value={passenger.title}
                    onChange={(e) =>
                      setPassenger((p) => ({
                        ...p,
                        title: e.target.value as PassengerForm["title"],
                      }))
                    }
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                </label>
                <label className="block text-sm sm:col-span-1">
                  <span className="mb-1 block font-semibold text-muted">
                    Nama depan
                  </span>
                  <input
                    required
                    className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                    value={passenger.firstName}
                    onChange={(e) =>
                      setPassenger((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-muted">
                    Nama belakang
                  </span>
                  <input
                    required
                    className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                    value={passenger.lastName}
                    onChange={(e) =>
                      setPassenger((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-muted">
                  No. identitas (opsional)
                </span>
                <input
                  className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                  value={passenger.idNumber}
                  onChange={(e) =>
                    setPassenger((p) => ({ ...p, idNumber: e.target.value }))
                  }
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-muted">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-muted">
                    Telepon
                  </span>
                  <input
                    className="field-input w-full rounded-xl border border-line bg-white px-3 py-2.5 font-semibold"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
              </div>

              {error ? (
                <p className="text-sm font-semibold text-red-600">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-3.5 text-sm font-extrabold text-white transition enabled:hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "Membuat PNR…" : "Buat booking & lanjut bayar"}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg">
          <SiteHeader variant="solid" />
          <p className="p-8 text-center text-muted">Memuat…</p>
        </main>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
