import { BrandLogo } from "@/components/BrandLogo";

export function SiteHeader({
  variant = "transparent",
}: {
  variant?: "transparent" | "solid";
}) {
  const solid = variant === "solid";
  return (
    <header
      className={`${
        solid
          ? "bg-brand-navy"
          : "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent"
      } px-4 py-3 text-white`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <BrandLogo size="header" />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/85 sm:flex">
          <span className="text-white">Pesawat</span>
          <span className="cursor-default opacity-50">Hotel</span>
          <span className="cursor-default opacity-50">Mobil</span>
        </nav>
      </div>
    </header>
  );
}
