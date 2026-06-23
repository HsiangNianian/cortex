export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4 px-4 py-8">
      <div className="h-8 w-32 rounded bg-muted" />
      <div className="h-12 w-full rounded-xl bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
