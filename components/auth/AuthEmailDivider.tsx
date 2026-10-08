"use client";

import { isFirebaseClientConfigured } from "@/lib/firebase/client";

export function AuthEmailDivider() {
  if (!isFirebaseClientConfigured()) {
    return null;
  }

  return (
    <div className="relative py-2 pt-4">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-card-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-card px-3 text-muted">or</span>
      </div>
    </div>
  );
}
