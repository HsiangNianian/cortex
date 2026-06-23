export default function SponsorsLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="h-4 w-96 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
