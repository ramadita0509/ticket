import { DestinationDeals } from "@/components/DestinationDeals";
import { PromoBoard } from "@/components/PromoBoard";
import { SearchForm } from "@/components/SearchForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listPublishedCampaigns } from "@/lib/home-campaigns";
import { getPublishedDestinationSection } from "@/lib/home-destinations";

const HERO =
  "https://images.unsplash.com/photo-1436491865332-7a61a77f81ad?auto=format&fit=crop&w=2400&q=80";

export default async function HomePage() {
  const [campaigns, destinations] = await Promise.all([
    listPublishedCampaigns(),
    getPublishedDestinationSection(),
  ]);
  const contact = campaigns[0]?.contact;

  return (
    <main className="min-h-screen bg-bg">
      <section className="relative flex min-h-[100svh] flex-col">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/55 to-brand-navy/85" />
          <div className="hero-glow absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        </div>

        <SiteHeader />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-16 pt-28 sm:pb-24 sm:pt-32">
          <div className="mb-10 max-w-2xl animate-fade-up">
            <div className="mb-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">El Wafa Travel</h1>
            </div>
            <h1 className="text-xl font-semibold leading-snug text-white/95 sm:text-2xl">
              Terbang lebih jauh, dengan harga yang jelas.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              Spesialis tiket Group pesawat Middle East.
            </p>
          </div>

          <div className="w-full animate-fade-up-delay">
            <SearchForm />
          </div>
        </div>
      </section>

      {campaigns.length > 0 ? (
        <section className="space-y-10 bg-[#eef3f8] px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              Promo Umroh
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">
              Paket group siap berangkat
            </h2>
          </div>
          <div className="mx-auto flex max-w-7xl flex-col gap-10">
            {campaigns.map((c) => (
              <PromoBoard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      ) : null}

      {destinations ? (
        <DestinationDeals
          eyebrow={destinations.eyebrow}
          title={destinations.title}
          deals={destinations.deals}
        />
      ) : null}

      <SiteFooter contact={contact} />
    </main>
  );
}
