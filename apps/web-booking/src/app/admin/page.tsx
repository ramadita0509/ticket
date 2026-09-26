import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAllCampaigns } from "@/lib/home-campaigns";
import { getOrCreateDestinationSection } from "@/lib/home-destinations";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  const [campaigns, destinations] = await Promise.all([
    listAllCampaigns(),
    getOrCreateDestinationSection(),
  ]);

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-line bg-brand-navy px-4 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-lg font-extrabold">Admin · Promo Home</p>
            <p className="text-sm text-white/70">
              Kelola flyer Umroh & Destinasi populer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
              Lihat home
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <section className="space-y-4">
          <h1 className="text-xl font-extrabold text-ink">Destinasi populer</h1>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-4">
            <div>
              <p className="font-extrabold text-ink">
                {destinations.eyebrow} · {destinations.title}
              </p>
              <p className="text-sm text-muted">
                {destinations.published ? "published" : "draft"}
                {` · ${destinations.deals.length} kartu`}
              </p>
            </div>
            <Link
              href="/admin/destinations"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-extrabold text-white"
            >
              Edit
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-extrabold text-ink">Promo Umroh</h1>
            <Link
              href="/admin/campaigns/new"
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-white"
            >
              + Campaign baru
            </Link>
          </div>

          <ul className="space-y-3">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <div>
                  <p className="font-extrabold text-ink">
                    {c.title} · {c.periodLabel}
                  </p>
                  <p className="text-sm text-muted">
                    {c.airlineName}
                    {c.published ? " · published" : " · draft"}
                    {` · ${c.packages.length} paket`}
                  </p>
                </div>
                <Link
                  href={`/admin/campaigns/${c.id}`}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-extrabold text-white"
                >
                  Edit
                </Link>
              </li>
            ))}
            {campaigns.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-muted">
                Belum ada campaign. Buat yang pertama.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </main>
  );
}
