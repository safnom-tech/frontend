"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { notify, notifyApiError } from "@/lib/notify";
import * as publishingApi from "@/services/publishing.api";

export function EditorUnpublishedBanner() {
  const { website, websiteId, flushAutosave } = useEditor();
  const { currentWorkspace } = useWorkspace();
  const [publishing, setPublishing] = useState(false);

  if (
    !website ||
    website.status !== "PUBLISHED" ||
    !website.hasUnpublishedChanges
  ) {
    return null;
  }

  async function onRepublish() {
    if (!currentWorkspace) return;
    setPublishing(true);
    try {
      await flushAutosave();
      await publishingApi.publishWebsite(currentWorkspace.id, websiteId);
      notify.success("Live site updated with your latest colors and content.");
      window.location.reload();
    } catch (err) {
      notifyApiError(err, "Republish failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/[0.12] px-3 py-2 text-xs sm:px-4">
      <p className="text-amber-950 dark:text-amber-100">
        <span className="font-semibold">Draft saved</span> — theme and block
        colors are not on the live site until you republish.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="px-2.5 py-1.5 text-xs"
          disabled={publishing}
          onClick={() => void onRepublish()}
        >
          {publishing ? "Publishing…" : "Republish now"}
        </Button>
        <Link
          href={`/dashboard/websites/${websiteId}/live`}
          className="btn-secondary rounded-lg px-2.5 py-1.5 text-xs"
        >
          Live site settings
        </Link>
      </div>
    </div>
  );
}
