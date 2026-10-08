/** Thin-stroke logistics icons for Ocean Crown-style sections. */

import type { ReactElement, ReactNode } from "react";

type IconProps = { className?: string };

function Svg({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-8 w-8"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconAirFreight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 28h10l6-8 4 2-3 6h9l5-4 3 1.5-3.5 6.5H42" />
      <path d="M10 32h28" />
      <path d="M18 20l4-8h3l2 8" />
    </Svg>
  );
}

export function IconLandFreight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="18" width="22" height="12" rx="1" />
      <path d="M26 22h8l6 6v2H26V22Z" />
      <circle cx="12" cy="32" r="3" />
      <circle cx="34" cy="32" r="3" />
      <path d="M8 18V14h10v4" />
    </Svg>
  );
}

export function IconSeaFreight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 28h32l-3 6H11l-3-6Z" />
      <path d="M14 28V16h6v12M22 28V12h6v16M30 28V18h6v10" />
      <path d="M6 36c3 2 6 2 9 0s6-2 9 0 6 2 9 0 6-2 9 0" />
    </Svg>
  );
}

export function IconProjectCargo({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 34V20h8v6h6l4 4v4H10Z" />
      <path d="M14 20V12h12v8" />
      <rect x="28" y="10" width="10" height="10" />
      <path d="M30 20v6h8" />
      <circle cx="14" cy="36" r="2.5" />
      <circle cx="30" cy="36" r="2.5" />
    </Svg>
  );
}

export function IconShippingAgency({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 38V14l14-6 14 6v24" />
      <path d="M18 38V22h12v16" />
      <path d="M18 28h12M22 22v16M26 22v16" />
      <path d="M10 38h28" />
    </Svg>
  );
}

export function IconCustoms({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="12" y="8" width="20" height="28" rx="1" />
      <path d="M16 14h12M16 20h12M16 26h8" />
      <path d="M28 32h4v4h-4z" />
    </Svg>
  );
}

const ICON_MAP: Record<string, (p: IconProps) => ReactElement> = {
  "air freight": IconAirFreight,
  "land freight": IconLandFreight,
  "sea freight": IconSeaFreight,
  "project cargo": IconProjectCargo,
  "shipping agency": IconShippingAgency,
  "customs support": IconCustoms,
};

export function LogisticsServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const key = name.trim().toLowerCase();
  const Icon = ICON_MAP[key] ?? IconShippingAgency;
  return <Icon className={className} />;
}
