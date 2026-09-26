"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { formatMoney } from "@/lib/money";

type BookingView = {
  id: string;
  pnr: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  origin: string;
  destination: string;
  contactEmail: string | null;
  hasTicketPdf: boolean;
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
    ticketNumber: string | null;
  }>;
  segments: Array<{
    flightNumber: string;
    from: string;
    to: string;
    departAt: string;
    arriveAt: string;
  }>;
};

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        opts?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Menunggu pembayaran";
    case "PAID":
      return "Dibayar — menerbitkan tiket…";
    case "ISSUED":
      return "Tiket terbit";
    case "TICKET_FAILED":
      return "Gagal ticketing";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status;
  }
}

function loadSnapScript(
  isProduction: boolean,
  clientKey: string
): Promise<void> {
  const src = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      if (clientKey) existing.setAttribute("data-client-key", clientKey);
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    if (clientKey) s.setAttribute("data-client-key", clientKey);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.body.appendChild(s);
  });
}

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/bookings/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Booking not found");
    setBooking(data.booking as BookingView);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat booking");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!booking) return;
    if (booking.status !== "PAID") return;

    const t = setInterval(() => {
      void refresh().catch(() => undefined);
    }, 2000);
    return () => clearInterval(t);
  }, [booking?.status, refresh]);

  async function payMock() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/pay/mock`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pembayaran gagal");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pembayaran gagal");
    } finally {
      setPaying(false);
    }
  }

  async function paySnap() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal inisiasi pembayaran");

      if (data.mode === "mock") {
        await payMock();
        return;
      }

      await loadSnapScript(Boolean(data.isProduction), String(data.clientKey ?? ""));
      if (!window.snap) {
        throw new Error("Snap belum siap");
      }

      window.snap.pay(data.token as string, {
        onSuccess: () => {
          setPaying(false);
          void refresh();
        },
        onPending: () => {
          setPaying(false);
          void refresh();
        },
        onError: () => {
          setPaying(false);
          setError("Pembayaran gagal");
        },
        onClose: () => {
          setPaying(false);
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pembayaran gagal");
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader variant="solid" />

      <div className="border-b border-white/10 bg-brand-navy px-4 pb-6 pt-2 text-white">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <Link
            href="/"
            className="mb-2 inline-block text-sm font-semibold text-white/65 transition hover:text-white"
          >
            ← Beranda
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Booking {booking?.pnr ? `· ${booking.pnr}` : ""}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {booking ? statusLabel(booking.status) : "Memuat…"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        {error && !booking ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center text-muted">
            {error}
          </div>
        ) : booking ? (
          <>
            <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Rute
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-ink">
                    {booking.origin} → {booking.destination}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    PNR{" "}
                    <span className="font-extrabold text-ink">
                      {booking.pnr ?? "—"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-price">
                    {formatMoney(booking.totalAmount, booking.currency)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                {booking.segments.map((s) => (
                  <li
                    key={`${s.flightNumber}-${s.departAt}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="font-semibold">{s.flightNumber}</span>
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
                Penumpang
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {booking.passengers.map((p, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="font-semibold text-ink">
                      {p.title} {p.firstName} {p.lastName}
                    </span>
                    <span className="text-muted">
                      {p.ticketNumber ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {error ? (
              <p className="text-sm font-semibold text-red-600">{error}</p>
            ) : null}

            {booking.status === "PENDING_PAYMENT" ? (
              <div className="animate-fade-up-late space-y-3 rounded-2xl border border-line bg-surface p-5">
                <p className="text-sm text-muted">
                  Bayar untuk menerbitkan e-ticket. Tanpa kunci Midtrans,
                  tombol demo akan settle langsung.
                </p>
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => void paySnap()}
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-extrabold text-white transition enabled:hover:brightness-110 disabled:opacity-60"
                >
                  {paying ? "Memproses…" : "Bayar sekarang"}
                </button>
              </div>
            ) : null}

            {booking.status === "PAID" ? (
              <div className="rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
                Pembayaran diterima. Sedang menerbitkan tiket…
              </div>
            ) : null}

            {booking.status === "ISSUED" ? (
              <div className="animate-fade-up space-y-3 rounded-2xl border border-success/30 bg-[#eef9f4] p-5">
                <p className="font-extrabold text-success">
                  E-ticket siap
                </p>
                <p className="text-sm text-muted">
                  PDF tersimpan
                  {booking.contactEmail
                    ? ` · dikirim ke ${booking.contactEmail} (jika SMTP aktif)`
                    : ""}
                </p>
                <a
                  href={`/api/bookings/${booking.id}/ticket`}
                  className="inline-flex rounded-xl bg-success px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
                >
                  Unduh e-ticket PDF
                </a>
              </div>
            ) : null}

            {booking.status === "TICKET_FAILED" ? (
              <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-red-600">
                Ticketing gagal. Coba refresh halaman atau hubungi support.
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center text-muted">
            Memuat booking…
          </div>
        )}
      </div>
    </main>
  );
}
