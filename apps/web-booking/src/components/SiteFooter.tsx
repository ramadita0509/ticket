import type { CampaignContact } from "@/lib/home-campaign-types";
import { resolveSiteContact } from "@/lib/site-contact";

export function SiteFooter({ contact }: { contact?: CampaignContact }) {
  const c = resolveSiteContact(contact);
  const waLinks = c.whatsapp.map((n) => {
    const digits = n.replace(/\D/g, "").replace(/^0/, "62");
    return { label: n, href: `https://wa.me/${digits}` };
  });

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <p className="text-lg font-extrabold">El Wafa Travel</p>
          <p className="mt-1 text-sm text-white/70">Your Ticketing Solution</p>
        </div>
        <div className="space-y-2.5 text-sm">
          <p>
            <span className="mr-2 font-extrabold text-accent">IG</span>
            <span className="text-white/90">{c.instagram}</span>
          </p>
          <p>
            <span className="mr-2 font-extrabold text-accent">FB</span>
            <span className="text-white/90">{c.facebook}</span>
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-extrabold text-accent">WA</span>
            {waLinks.map((w, i) => (
              <span key={w.href} className="text-white/90">
                {i > 0 ? <span className="text-white/40"> / </span> : null}
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {w.label}
                </a>
              </span>
            ))}
          </p>
          <p className="pt-1 leading-relaxed text-white/70">
            <span className="mr-2 font-extrabold text-accent">Alamat</span>
            {c.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
