import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold",
  secondary: "btn-secondary rounded-xl px-4 py-2.5 text-sm",
  ghost:
    "text-sm font-medium text-brand hover:text-brand-deep dark:text-accent-soft transition-colors",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
