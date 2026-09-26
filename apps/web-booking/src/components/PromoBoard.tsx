"use client";

import type {
  CampaignPackage,
  CampaignTerm,
  HomeCampaignDTO,
} from "@/lib/home-campaign-types";

function TermIcon({ icon }: { icon: CampaignTerm["icon"] }) {
  const common = "h-5 w-5 shrink-0 text-accent";
  switch (icon) {
    case "deposit":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 8v8M9 10.5h4.5a1.5 1.5 0 0 1 0 3H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "baggage":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="8" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "manifest":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 4h10v16H7z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10 9h4M10 13h4M10 17h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "refund":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
          <path d="m8 8 8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 19c1.5-3 3.5-4.5 6-4.5S16.5 16 18 19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="m8 8 8 8" stroke="#c2410c" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
  }
}

function PackageCard({ pkg }: { pkg: CampaignPackage }) {
  return (
    <article className="overflow-hidden rounded-xl border border-brand-deep/15 bg-white shadow-[0_8px_24px_rgba(2,24,46,0.08)]">
      <div className="flex items-center gap-2 bg-gradient-to-r from-brand-deep to-brand px-3 py-2 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-white">
          ✈
        </span>
        <p className="text-sm font-extrabold tracking-wide">
          {pkg.code} / {pkg.durationLabel}
        </p>
      </div>
      {pkg.note ? (
        <p className="bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
          *{pkg.note}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-[11px]">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-2 py-1.5 font-semibold">Tgl</th>
              <th className="px-2 py-1.5 font-semibold">Flight</th>
              <th className="px-2 py-1.5 font-semibold">Rute</th>
              <th className="px-2 py-1.5 font-semibold">Berangkat</th>
              <th className="px-2 py-1.5 font-semibold">Tiba</th>
            </tr>
          </thead>
          <tbody>
            {pkg.flights.map((f, i) => (
              <tr
                key={`${f.flightNo}-${f.date}-${i}`}
                className={i % 2 === 0 ? "bg-white" : "bg-[#f3f7fb]"}
              >
                <td className="px-2 py-1.5 font-semibold text-ink">{f.date}</td>
                <td className="px-2 py-1.5 font-bold text-brand-deep">
                  {f.flightNo}
                </td>
                <td className="px-2 py-1.5 text-muted">{f.route}</td>
                <td className="px-2 py-1.5 font-semibold">{f.depart}</td>
                <td className="px-2 py-1.5 font-semibold">{f.arrive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function PromoBoard({ campaign }: { campaign: HomeCampaignDTO }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-brand-deep/10 bg-white shadow-[0_20px_60px_rgba(2,24,46,0.12)]">
      <div
        className="relative overflow-hidden bg-brand-navy px-5 py-8 text-white sm:px-8"
        style={
          campaign.heroImageUrl
            ? {
                backgroundImage: `linear-gradient(110deg, rgba(2,24,46,0.92), rgba(5,50,92,0.78)), url(${campaign.heroImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
              {campaign.airlineName}
            </p>
            <h2 className="mt-2 font-extrabold leading-tight">
              <span className="block text-3xl text-accent sm:text-4xl">
                {campaign.title}
              </span>
              <span className="mt-1 inline-block rounded-lg bg-accent px-3 py-1 text-lg text-white sm:text-xl">
                {campaign.periodLabel}
              </span>
            </h2>
            {campaign.partnerBanner ? (
              <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90 ring-1 ring-white/20">
                {campaign.partnerBanner}
              </p>
            ) : null}
          </div>
          {campaign.slogan ? (
            <p className="max-w-xs text-right text-base italic text-white/85 sm:text-lg">
              {campaign.slogan}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {campaign.packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {campaign.terms.length > 0 ? (
        <div className="border-t border-line bg-[#f7fafc] px-4 py-5 sm:px-6">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-accent">
            Terms & Condition
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campaign.terms.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-line/80"
              >
                <TermIcon icon={t.icon} />
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
