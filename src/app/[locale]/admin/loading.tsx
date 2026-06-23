export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-32 rounded bg-muted" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
