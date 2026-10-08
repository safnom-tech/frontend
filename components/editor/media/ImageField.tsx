"use client";

import { useRef, useState } from "react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import { FieldLabel, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as mediaApi from "@/services/media.api";

export function ImageField({
  url,
  alt,
  onUrlChange,
  onAltChange,
  onClear,
  showPreview = true,
}: {
  url: string;
  alt: string;
  onUrlChange: (v: string) => void;
  onAltChange: (v: string) => void;
  onClear: () => void;
  showPreview?: boolean;
}) {
  const { currentWorkspace } = useWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayUrl = url ? mediaApi.mediaUrlForDisplay(url) : "";

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      onUrlChange(res.data.url);
      if (!alt.trim()) {
        onAltChange(res.data.originalFilename.replace(/\.[^.]+$/, ""));
      }
    } catch (err) {
      setUploadError(err instanceof ApiClientError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPasteUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      onUrlChange("");
      return;
    }
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      onUrlChange(trimmed);
      return;
    }
    setUploadError("External links must start with https:// or http://");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="rounded-lg text-xs"
          onClick={() => setPickerOpen(true)}
        >
          Choose from library
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => void onPickFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          className="rounded-lg text-xs"
          disabled={uploading || !currentWorkspace}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload new"}
        </Button>
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}

      <div>
        <FieldLabel htmlFor="img-url">Or paste external link</FieldLabel>
        <Input
          id="img-url"
          value={url.startsWith("data:") ? "" : url}
          onChange={(e) => onPasteUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <FieldLabel htmlFor="img-alt">Description (for accessibility)</FieldLabel>
        <Input
          id="img-alt"
          value={alt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="What the image shows"
        />
      </div>

      {showPreview && displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={alt || "Preview"}
          className="max-h-48 w-full rounded-lg object-cover"
        />
      ) : null}

      {url ? (
        <button
          type="button"
          className="text-xs text-red-600 hover:underline"
          onClick={onClear}
        >
          Remove image
        </button>
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          onUrlChange(media.url);
          if (!alt.trim()) {
            onAltChange(media.originalFilename.replace(/\.[^.]+$/, ""));
          }
        }}
      />
    </div>
  );
}
