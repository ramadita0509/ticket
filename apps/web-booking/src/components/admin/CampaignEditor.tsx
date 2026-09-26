"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeCampaignDTO } from "@/lib/home-campaign-types";

type Props = {
  mode: "create" | "edit";
  initial?: HomeCampaignDTO;
};

export function CampaignEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "Tiket UMROH");
  const [periodLabel, setPeriodLabel] = useState(
    initial?.periodLabel ?? "2027"
  );
  const [airlineName, setAirlineName] = useState(
    initial?.airlineName ?? "Etihad Airways"
  );
  const [partnerBanner, setPartnerBanner] = useState(
    initial?.partnerBanner ?? ""
  );
  const [slogan, setSlogan] = useState(
    initial?.slogan ?? "Ibadah Nyaman, Perjalanan Berkah"
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    initial?.heroImageUrl ?? ""
  );
  const [airlineLogoUrl, setAirlineLogoUrl] = useState(
    initial?.airlineLogoUrl ?? ""
  );
  const [packagesJson, setPackagesJson] = useState(
    JSON.stringify(initial?.packages ?? [], null, 2)
  );
  const [termsJson, setTermsJson] = useState(
    JSON.stringify(initial?.terms ?? [], null, 2)
  );
  const [contactJson, setContactJson] = useState(
    JSON.stringify(initial?.contact ?? {}, null, 2)
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File, target: "hero" | "logo") {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      if (target === "hero") setHeroImageUrl(data.url);
      else setAirlineLogoUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Validate JSON fields
      JSON.parse(packagesJson);
      JSON.parse(termsJson);
      JSON.parse(contactJson);

      const payload = {
        title,
        periodLabel,
        airlineName,
        partnerBanner: partnerBanner || null,
        slogan: slogan || null,
        heroImageUrl: heroImageUrl || null,
        airlineLogoUrl: airlineLogoUrl || null,
        packagesJson,
        termsJson,
        contactJson,
        published,
        sortOrder,
      };

      const res = await fetch(
        mode === "create"
          ? "/api/admin/campaigns"
          : `/api/admin/campaigns/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
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

  async function onDelete() {
    if (!initial || !confirm("Hapus campaign ini?")) return;
    const res = await fetch(`/api/admin/campaigns/${initial.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Judul">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Field>
        <Field label="Periode">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            required
          />
        </Field>
        <Field label="Maskapai">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={airlineName}
            onChange={(e) => setAirlineName(e.target.value)}
            required
          />
        </Field>
        <Field label="Banner partner">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={partnerBanner}
            onChange={(e) => setPartnerBanner(e.target.value)}
          />
        </Field>
        <Field label="Slogan" className="sm:col-span-2">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Hero image URL">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 text-sm"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f, "hero");
            }}
          />
        </Field>
        <Field label="Airline logo URL">
          <input
            className="w-full rounded-xl border border-line px-3 py-2.5 font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
            value={airlineLogoUrl}
            onChange={(e) => setAirlineLogoUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 text-sm"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f, "logo");
            }}
          />
        </Field>
      </div>

      <Field label="Packages JSON">
        <textarea
          className="min-h-48 w-full rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
          value={packagesJson}
          onChange={(e) => setPackagesJson(e.target.value)}
        />
      </Field>
      <Field label="Terms JSON">
        <textarea
          className="min-h-32 w-full rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
          value={termsJson}
          onChange={(e) => setTermsJson(e.target.value)}
        />
      </Field>
      <Field label="Contact JSON">
        <textarea
          className="min-h-28 w-full rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-semibold outline-none focus:ring-[3px] focus:ring-brand/25"
          value={contactJson}
          onChange={(e) => setContactJson(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (tampil di home)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Sort
          <input
            type="number"
            className="w-20 rounded-lg border border-line px-2 py-1"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white"
          >
            Hapus
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
