"use client";

export default function PublicSiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-semibold">This website could not be shown</p>
      <p className="mt-2 max-w-md text-sm text-muted">
        The live site hit a server error while loading. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Reload
      </button>
    </main>
  );
}
