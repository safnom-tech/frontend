"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group !rounded-xl !border !border-card-border !bg-card !text-foreground !shadow-lg !shadow-black/10",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-muted",
          closeButton:
            "!border-card-border !bg-background !text-muted hover:!text-foreground",
        },
      }}
    />
  );
}
