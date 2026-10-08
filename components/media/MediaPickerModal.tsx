"use client";

import { MediaLibrary } from "@/components/media/MediaLibrary";
import type { Media } from "@/types/media";

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-card-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
          <h2 className="text-sm font-semibold">Media Library</h2>
          <button
            type="button"
            className="text-sm text-muted hover:text-brand"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <MediaLibrary
            selectionMode
            onSelect={(media) => {
              onSelect(media);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
