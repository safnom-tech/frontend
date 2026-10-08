"use client";

import { ImageField } from "@/components/editor/media/ImageField";
import type { PageSection } from "@/types/page";

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v : "";
}

export function sectionBannerImageKeys(
  section: PageSection
): { urlKey: string; altKey: string; title: string } | null {
  if (section.type === "HERO") {
    return {
      urlKey: "imageUrl",
      altKey: "imageAlt",
      title: "Banner / hero image",
    };
  }
  if (section.type === "IMAGE") {
    return { urlKey: "url", altKey: "alt", title: "Banner image" };
  }
  return null;
}

export function EditBannerImageDialog({
  section,
  onClose,
  onUpdateData,
}: {
  section: PageSection;
  onClose: () => void;
  onUpdateData: (data: Record<string, unknown>) => void;
}) {
  const keys = sectionBannerImageKeys(section);
  if (!keys) return null;

  const d = section.data;
  const url = str(d, keys.urlKey);
  const alt = str(d, keys.altKey);

  return (
    <div
      className="fixed inset-0 z-[201] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-label={keys.title}
      onClick={onClose}
    >
      <div
        className="max-h-[min(85vh,560px)] w-full max-w-md overflow-y-auto rounded-xl border border-card-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-card-border bg-white px-4 py-3">
          <p className="text-sm font-semibold">{keys.title}</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-muted hover:bg-black/[0.04]"
            onClick={onClose}
          >
            Done
          </button>
        </div>
        <div className="p-4">
          <ImageField
            url={url}
            alt={alt}
            onUrlChange={(nextUrl) =>
              onUpdateData({ ...d, [keys.urlKey]: nextUrl })
            }
            onAltChange={(nextAlt) =>
              onUpdateData({ ...d, [keys.altKey]: nextAlt })
            }
            onClear={() =>
              onUpdateData({ ...d, [keys.urlKey]: "", [keys.altKey]: "" })
            }
          />
        </div>
      </div>
    </div>
  );
}
