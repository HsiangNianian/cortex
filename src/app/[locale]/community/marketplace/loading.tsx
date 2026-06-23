export default function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
