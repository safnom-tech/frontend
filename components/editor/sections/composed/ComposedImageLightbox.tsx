"use client";

import { ModalPortal } from "@/components/ui/ModalPortal";

export function ComposedImageLightbox({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[280] flex items-center justify-center bg-black/80 p-4"
        role="dialog"
        aria-modal
        aria-label="Image preview"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[min(90vh,900px)] max-w-[min(92vw,1200px)] rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </ModalPortal>
  );
}
