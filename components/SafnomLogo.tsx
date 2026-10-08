import Image from "next/image";
import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";
import { brandLogo } from "@/config/brand";

export function SafnomLogo({
  className = "",
  showWordmark = false,
  size = "header",
  href = "/",
}: {
  className?: string;
  /** Text wordmark beside logo; default false — logo image includes SAFNOM */
  showWordmark?: boolean;
  size?: "header" | "hero";
  /** Link target; pass `null` to render without a link */
  href?: string | null;
}) {
  const height =
    size === "hero" ? brandLogo.heroHeight : brandLogo.headerHeight;

  const inner = (
    <>
      <Image
        src={brandLogo.src}
        alt={brandLogo.alt}
        width={height * 2.2}
        height={height}
        className="h-auto w-auto object-contain"
        style={{ height, width: "auto", maxWidth: height * 2.4 }}
        priority
      />
      {showWordmark ? <BrandWordmark className="text-lg" /> : null}
    </>
  );

  const wrapClass = `inline-flex items-center gap-2.5 ${className}`;

  if (href == null) {
    return <span className={wrapClass}>{inner}</span>;
  }

  return (
    <Link href={href} className={wrapClass}>
      {inner}
    </Link>
  );
}
