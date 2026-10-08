"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Reveals each section in order as it enters the viewport (step-by-step scroll). */
export function SectionReveal({
  index,
  children,
  enabled = true,
  className = "",
}: {
  index: number;
  children: ReactNode;
  enabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!enabled || index === 0);

  useEffect(() => {
    if (!enabled || index === 0) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, index]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${className} ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0"
      }`}
      style={{
        transitionDelay: visible ? `${Math.min(index, 4) * 40}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
