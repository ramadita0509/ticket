import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="text-xl font-extrabold text-ink">Admin El Wafa</h1>
        <p className="mt-1 text-sm text-muted">
          Masuk untuk kelola promo Umroh di home.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
