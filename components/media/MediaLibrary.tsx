"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Alert } from "@/components/ui/Alert";
import { confirmAction } from "@/lib/confirm";
import { notify, notifyApiError } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as mediaApi from "@/services/media.api";
import type { Media } from "@/types/media";

export function MediaLibrary({
  selectionMode = false,
  onSelect,
}: {
  selectionMode?: boolean;
  onSelect?: (media: Media) => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await mediaApi.listMedia(currentWorkspace.id);
      setItems(res.data.media);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to load media"
      );
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onUploadFiles(files: FileList | null) {
    if (!currentWorkspace || !files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await mediaApi.uploadMedia(currentWorkspace.id, file);
      }
      await load();
      notify.success("Upload complete");
    } catch (err) {
      notifyApiError(err, "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onReplace(mediaId: string, file: File) {
    if (!currentWorkspace) return;
    setError(null);
    try {
      await mediaApi.replaceMedia(currentWorkspace.id, mediaId, file);
      await load();
      notify.success("File replaced");
    } catch (err) {
      notifyApiError(err, "Replace failed");
    }
  }

  async function onDelete(media: Media) {
    if (!currentWorkspace) return;
    if (
      !(await confirmAction({
        title: "Delete file?",
        message: `Delete "${media.originalFilename}" from your library?`,
        confirmLabel: "Delete",
        tone: "danger",
      }))
    ) {
      return;
    }
    try {
      await mediaApi.deleteMedia(currentWorkspace.id, media.id);
      notify.success("File deleted");
      await load();
    } catch (err) {
      notifyApiError(err, "Delete failed");
    }
  }

  return (
    <div>
      {!selectionMode ? (
        <DashboardPageHeader
          title="Media Library"
          description="Images for your workspace websites"
          actions={
            <>
              <input
                ref={uploadRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={(e) => void onUploadFiles(e.target.files)}
              />
              <Button
                type="button"
                className="rounded-lg text-sm"
                disabled={uploading}
                onClick={() => uploadRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
            </>
          }
        />
      ) : (
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Choose an image</p>
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={(e) => void onUploadFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            className="rounded-lg text-xs"
            disabled={uploading}
            onClick={() => uploadRef.current?.click()}
          >
            Upload new
          </Button>
        </div>
      )}

      {error ? (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {loading ? (
        <div className="dashboard-panel p-8 text-sm text-muted">Loading…</div>
      ) : items.length === 0 ? (
        <div className="dashboard-panel p-10 text-center text-muted">
          No images yet. Upload your first image.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="dashboard-panel group overflow-hidden p-0"
            >
              <button
                type="button"
                className={`block w-full ${selectionMode ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (selectionMode && onSelect) onSelect(item);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaApi.mediaUrlForDisplay(item.url)}
                  alt={item.originalFilename}
                  className="aspect-square w-full object-cover"
                />
              </button>
              <div className="space-y-1 p-2">
                <p className="truncate text-xs font-medium" title={item.originalFilename}>
                  {item.originalFilename}
                </p>
                {!selectionMode ? (
                  <div className="flex gap-1">
                    <input
                      ref={(el) => {
                        replaceRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onReplace(item.id, f);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      className="text-[10px] text-brand hover:underline"
                      onClick={() => replaceRefs.current[item.id]?.click()}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      className="text-[10px] text-red-600 hover:underline"
                      onClick={() => void onDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
