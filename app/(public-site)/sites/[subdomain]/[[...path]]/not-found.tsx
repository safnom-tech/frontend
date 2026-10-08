export default function PublicSiteNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-semibold">This website is not available</p>
      <p className="mt-2 max-w-md text-sm text-muted">
        It may be unpublished, the address may be incorrect, or the page does
        not exist.
      </p>
    </main>
  );
}
