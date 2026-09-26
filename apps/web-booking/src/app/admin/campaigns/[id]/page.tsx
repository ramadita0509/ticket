import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCampaign } from "@/lib/home-campaigns";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin" className="text-sm font-semibold text-brand">
          ← Kembali
        </Link>
        <h1 className="mt-3 text-xl font-extrabold">
          Edit · {campaign.title} {campaign.periodLabel}
        </h1>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <CampaignEditor mode="edit" initial={campaign} />
        </div>
      </div>
    </main>
  );
}
