import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Header compact vs hero large */
  size?: "header" | "hero";
  /** Set false to render without link */
  linked?: boolean;
  className?: string;
};

export function BrandLogo({
  size = "header",
  linked = true,
  className = "",
}: Props) {
  const isHero = size === "hero";
  const image = (
    <Image
      src="/el-wafa-logo.png"
      alt="El Wafa Travel"
      width={286}
      height={228}
      priority
      className={
        isHero
          ? "h-auto w-[9.5rem] sm:w-[12rem] md:w-[14rem]"
          : "h-10 w-auto sm:h-11"
      }
    />
  );

  const shell = (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-white shadow-[0_12px_40px_rgba(2,24,46,0.28)] ${
        isHero ? "px-4 py-3 sm:px-5 sm:py-3.5" : "px-2.5 py-1.5"
      } ${className}`}
    >
      {image}
    </span>
  );

  if (!linked) return shell;

  return (
    <Link
      href="/"
      className="group inline-flex transition hover:scale-[1.02]"
      aria-label="El Wafa Travel"
    >
      {shell}
    </Link>
  );
}
