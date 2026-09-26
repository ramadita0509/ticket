import Link from "next/link";
import type { DestinationDeal } from "@/lib/home-campaign-types";
import { formatMoney } from "@/lib/money";

type Props = {
  eyebrow?: string;
  title?: string;
  deals: DestinationDeal[];
};

export function DestinationDeals({
  eyebrow = "Destinasi populer",
  title = "Penawaran siap berangkat",
  deals,
}: Props) {
  if (!deals.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">{title}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const body = (
            <article className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_10px_30px_rgba(12,27,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(11,107,203,0.12)]">
              <div
                className="h-40 bg-slate-100 bg-cover bg-center"
                style={
                  deal.imageUrl
                    ? { backgroundImage: `url(${deal.imageUrl})` }
                    : undefined
                }
              />
              <div className="p-4">
                <h3 className="text-lg font-extrabold text-ink">{deal.city}</h3>
                <p className="text-sm font-medium text-muted">{deal.country}</p>
                <ul className="mt-3 space-y-2 border-t border-line pt-3">
                  {deal.legs.map((leg, i) => (
                    <li
                      key={`${deal.id}-${i}`}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{leg.dateLabel}</p>
                        <p className="truncate text-xs text-muted">
                          {leg.routeLabel}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-extrabold text-ink">
                        {leg.direct === false ? "Transit" : "Langsung"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-right text-sm font-extrabold text-brand">
                  mulai{" "}
                  {formatMoney(deal.priceFrom, deal.currency ?? "IDR")} →
                </p>
              </div>
            </article>
          );

          if (deal.href) {
            return (
              <Link key={deal.id} href={deal.href} className="block">
                {body}
              </Link>
            );
          }
          return <div key={deal.id}>{body}</div>;
        })}
      </div>
    </section>
  );
}
