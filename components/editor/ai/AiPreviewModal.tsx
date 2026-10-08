"use client";

import { Button } from "@/components/ui/Button";

export function AiPreviewModal({
  open,
  title,
  previewJson,
  loading,
  onClose,
  onApply,
}: {
  open: boolean;
  title: string;
  previewJson: string;
  loading?: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-card-border bg-card p-4 shadow-xl">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted">Review the suggestion before applying.</p>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-black/[0.04] p-3 text-xs">
          {loading ? "Generating…" : previewJson}
        </pre>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" className="rounded-lg text-xs" onClick={onClose}>
            Discard
          </Button>
          <Button
            type="button"
            className="rounded-lg text-xs"
            disabled={loading}
            onClick={onApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
