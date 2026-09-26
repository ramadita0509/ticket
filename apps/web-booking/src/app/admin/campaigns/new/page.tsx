import Link from "next/link";
import { redirect } from "next/navigation";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function NewCampaignPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin" className="text-sm font-semibold text-brand">
          ← Kembali
        </Link>
        <h1 className="mt-3 text-xl font-extrabold">Campaign baru</h1>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <CampaignEditor mode="create" />
        </div>
      </div>
    </main>
  );
}
