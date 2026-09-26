"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Keluar
    </button>
  );
}
