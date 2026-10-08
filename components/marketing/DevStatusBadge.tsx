"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth } from "@/services/api";

/** Subtle developer status — not shown in main marketing hero. */
export function DevStatusBadge() {
  const [label, setLabel] = useState<string>("Checking…");
  const [ok, setOk] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await getHealth();
      setOk(res.data.database === "connected");
      setLabel(
        res.data.database === "connected"
          ? "All systems operational"
          : "Database connecting…"
      );
    } catch {
      setOk(false);
      setLabel("Platform starting up");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return (
    <button
      type="button"
      onClick={() => void check()}
      className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-foreground"
      title="Refresh platform status"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          ok === null
            ? "bg-amber-400 animate-pulse"
            : ok
              ? "bg-emerald-500"
              : "bg-amber-500"
        }`}
        aria-hidden
      />
      {label}
    </button>
  );
}
