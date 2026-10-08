"use client";

import { useRef, useState } from "react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { notifyApiError } from "@/lib/notify";
import * as mediaApi from "@/services/media.api";
import type { PageSection } from "@/types/page";

function bannerImageFields(section: PageSection): {
  urlField: string;
  altField: string;
  label: string;
} | null {
  if (section.type === "HERO") {
    return {
      urlField: "imageUrl",
      altField: "imageAlt",
      label: "Banner / hero image",
    };
  }
  if (section.type === "IMAGE") {
    return { urlField: "url", altField: "alt", label: "Banner image" };
  }
  return null;
}

export function SidePanelBannerImage({
  section,
}: {
  section: PageSection;
}) {
  const { updateSectionData } = useEditor();
  const { currentWorkspace } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = bannerImageFields(section);
  if (!fields) return null;

  const url = typeof section.data[fields.urlField] === "string"
    ? (section.data[fields.urlField] as string)
    : "";
  const displayUrl = url ? mediaApi.mediaUrlForDisplay(url) : "";

  function patch(partial: Record<string, string>) {
    updateSectionData(section.id, { ...section.data, ...partial });
  }

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setError(null);
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      patch({ [fields!.urlField]: res.data.url });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Upload failed";
      setError(message);
      notifyApiError(err, "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-card-border bg-black/[0.02] p-2.5">
      <p className="text-[11px] font-medium text-muted">{fields.label}</p>
      <div className="mt-2 overflow-hidden rounded-md border border-black/10 bg-neutral-100">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt=""
            className="aspect-[21/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[21/9] items-center justify-center text-[11px] text-muted">
            No image yet
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={uploading}
          className="rounded-md bg-brand px-2.5 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          className="rounded-md border border-card-border px-2.5 py-1 text-[10px] font-semibold"
          onClick={() => setPickerOpen(true)}
        >
          Library
        </button>
        {url ? (
          <button
            type="button"
            className="rounded-md border border-red-200 px-2.5 py-1 text-[10px] font-semibold text-red-600"
            onClick={() => patch({ [fields.urlField]: "" })}
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-[10px] text-red-600">{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => void onPickFile(e.target.files?.[0])}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => patch({ [fields.urlField]: media.url })}
      />
    </div>
  );
}
