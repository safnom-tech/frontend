"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-neutral-900">
        <p className="text-lg font-semibold">This website could not be shown</p>
        <p className="mt-2 max-w-md text-sm text-neutral-600">
          A server error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
