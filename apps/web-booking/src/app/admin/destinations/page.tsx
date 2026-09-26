import Link from "next/link";
import { redirect } from "next/navigation";
import { DestinationEditor } from "@/components/admin/DestinationEditor";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrCreateDestinationSection } from "@/lib/home-destinations";

export default async function AdminDestinationsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const section = await getOrCreateDestinationSection();

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin" className="text-sm font-semibold text-brand">
          ← Kembali
        </Link>
        <h1 className="mt-3 text-xl font-extrabold">
          Destinasi populer
        </h1>
        <p className="mt-1 text-sm text-muted">
          Section terpisah dari flyer Umroh — edit judul & kartu penawaran.
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <DestinationEditor initial={section} />
        </div>
      </div>
    </main>
  );
}
