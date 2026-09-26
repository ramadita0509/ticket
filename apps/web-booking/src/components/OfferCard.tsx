import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { FlightOffer } from "@/lib/travelport/types";

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16) || iso;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OfferCard({
  offer,
  index = 0,
}: {
  offer: FlightOffer;
  index?: number;
}) {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const departDay = first?.departAt?.slice(0, 10);
  const arriveDay = last?.arriveAt?.slice(0, 10);
  const plusDay =
    departDay && arriveDay && arriveDay > departDay ? "+1" : "";

  return (
    <article
      className="offer-enter group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(12,27,42,0.04)] transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_16px_40px_rgba(11,107,203,0.12)] sm:flex-row"
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className="min-w-0 flex-1 p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2fc] text-xs font-extrabold text-brand">
            {(offer.airlineCodes[0] ?? "XX").slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ink">
              {offer.airline}
            </p>
            <p className="text-xs font-semibold text-muted">
              {offer.cabin ?? "Economy"}
              {offer.provider === "mock" ? " · demo" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="min-w-[4.5rem]">
            <p className="text-2xl font-extrabold tracking-tight text-ink">
              {formatTime(first?.departAt ?? "")}
            </p>
            <p className="text-sm font-bold text-muted">{first?.from}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-1">
            <span className="text-[11px] font-semibold text-muted">
              {offer.totalDuration}
            </span>
            <div className="my-1.5 flex w-full items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="h-px flex-1 bg-line" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </div>
            <span className="text-[11px] font-semibold text-muted">
              {offer.stops === 0
                ? "Langsung"
                : `${offer.stops} perhentian`}
            </span>
          </div>

          <div className="min-w-[4.5rem] text-right">
            <p className="text-2xl font-extrabold tracking-tight text-ink">
              {formatTime(last?.arriveAt ?? "")}
              {plusDay ? (
                <sup className="ml-0.5 text-xs font-bold text-muted">
                  {plusDay}
                </sup>
              ) : null}
            </p>
            <p className="text-sm font-bold text-muted">{last?.to}</p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center gap-2 border-t border-line bg-[#f7fafc] px-5 py-4 sm:w-44 sm:border-l sm:border-t-0 sm:text-right">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Dari
        </p>
        <p className="text-lg font-extrabold text-price">
          {formatMoney(offer.price.amount, offer.price.currency)}
        </p>
        <Link
          href={`/checkout?offerId=${encodeURIComponent(offer.id)}`}
          className="mt-1 block rounded-xl bg-brand py-2.5 text-center text-sm font-extrabold text-white transition group-hover:brightness-110"
        >
          Pilih →
        </Link>
      </div>
    </article>
  );
}
