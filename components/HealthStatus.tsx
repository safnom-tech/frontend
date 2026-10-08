"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth } from "@/services/api";
import type { HealthData } from "@/types/api";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; data: HealthData; message: string }
  | { status: "error"; message: string };

export function HealthStatus() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const result = await getHealth();
      setState({
        status: "ok",
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="glass-card rounded-2xl p-6 text-left">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          API health
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-card-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-card/80 hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      {state.status === "loading" && (
        <p className="text-sm text-muted">Checking backend…</p>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      {state.status === "ok" && (
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-card-border/60 pb-2">
            <dt className="text-muted">Message</dt>
            <dd className="font-medium text-foreground">{state.message}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Status</dt>
            <dd className="font-mono text-emerald-600 dark:text-emerald-400">
              {state.data.status}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Database</dt>
            <dd
              className={`font-mono ${
                state.data.database === "connected"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {state.data.database}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
