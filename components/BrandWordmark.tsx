import type { ReactNode } from "react";
import { brandWordmarkText } from "@/config/brand";

const sizeClass = {
  /** Same line as hero headline — inherits size, accent color only */
  headline: "brand-name brand-name-headline",
  /** Auth titles */
  title: "brand-name text-[1.15em]",
  inline: "brand-name",
} as const;

export function BrandWordmark({
  className = "",
  size = "inline",
  children = brandWordmarkText,
}: {
  className?: string;
  size?: keyof typeof sizeClass;
  children?: ReactNode;
}) {
  return (
    <span className={`${sizeClass[size]} ${className}`.trim()}>{children}</span>
  );
}
