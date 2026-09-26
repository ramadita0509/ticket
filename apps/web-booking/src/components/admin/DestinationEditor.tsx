"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { DestinationSectionDTO } from "@/lib/home-campaign-types";

type Props = {
  initial: DestinationSectionDTO;
};

export function DestinationEditor({ initial }: Props) {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [dealsJson, setDealsJson] = useState(
    JSON.stringify(initial.deals, null, 2)
  );
  const [published, setPublished] = useState(initial.published);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      JSON.parse(dealsJson);
      const res = await fetch("/api/admin/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          title,
          dealsJson,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menyimpan"
        );
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-muted">Eyebrow</span>
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-muted">Judul</span>
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-muted">
          Deals JSON (array kartu destinasi)
        </span>
        <textarea
          className="min-h-72 w-full rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
          value={dealsJson}
          onChange={(e) => setDealsJson(e.target.value)}
        />
        <span className="mt-1 block text-xs text-muted">
          Field per item: id, city, country, imageUrl, priceFrom, currency?,
          legs (dateLabel, routeLabel, airline, direct?), href?
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Published (tampil di home)
      </label>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {saving ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
