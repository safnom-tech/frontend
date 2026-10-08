"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  confirmAction as confirmActionExport,
  registerConfirmHandler,
  type ConfirmOptions,
} from "@/lib/confirm";

type PendingConfirm = ConfirmOptions & { id: number };

const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const idRef = useRef(0);

  const runConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      if (resolveRef.current) {
        resolveRef.current(false);
      }
      resolveRef.current = resolve;
      idRef.current += 1;
      setPending({ ...options, id: idRef.current });
    });
  }, []);

  useEffect(() => {
    registerConfirmHandler(runConfirm);
    return () => registerConfirmHandler(null);
  }, [runConfirm]);

  function close(result: boolean) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setPending(null);
  }

  const tone = pending?.tone ?? "default";

  return (
    <ConfirmContext.Provider value={runConfirm}>
      {children}
      {pending ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => close(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="relative z-10 w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-xl shadow-black/10"
          >
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {pending.title ?? "Are you sure?"}
            </h2>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              {pending.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-card-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-black/[0.04]"
                onClick={() => close(false)}
              >
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                autoFocus
                className={
                  tone === "danger"
                    ? "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    : "rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                }
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return confirmActionExport;
  }
  return ctx;
}
